#!/home/dnscheck/dnsmon-master/venv/bin/python3
import secrets
from flask import Flask, flash, request, session, render_template, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from back.domains import domains_action_worker, domains_page
from back.login import login_page
from back.zones import zones_action_worker, zones_page
from initconf import ConfData, loadconf
from back.logger import logsetup
from back.forms import LoginForm, NewDomain, NewZone
from back.accessdb import AccessDB, enginer
from back.object import Domain, BadName, Zones
from back.functions import parse_list, domain_validate
from back.worker import add_object, edit_object, remove_object, switch_object
from back.auth import check_auth

app = Flask(__name__)

@app.before_request
def before_request():
    if check_auth(app) is True:
        return redirect(request.url)
    elif check_auth(app) is False:
        return login()

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.jinja'), 404

@app.errorhandler(405)
def page_not_found(e):
    return render_template('404.jinja'), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.jinja'), 500

@app.route('/login', methods=['GET','POST'])
def login():
    return login_page()

@app.route('/')
def index():
    ua = request.headers.get('User-Agent')
    return render_template('index.jinja', ua = ua, current_time=datetime.utcnow())

@app.route('/user/<name>')
def user(name):
    return '<h1>Hello, %s!</h1>' %  (name)

@app.route('/domains', methods=['GET','POST'])
def domains():
    return domains_page(app)

@app.route('/domains/<action>', methods = ['POST'])
def domain_action(action):
    return domains_action_worker(app, action)

@app.route('/zones', methods=['GET','POST'])
def zones():
    return zones_page(app)

@app.route('/zones/<zone>/<action>', methods = ['POST'])
def zone_action(zone, action):
    return zones_action_worker(app, zone, action)


@app.route('/t/<test>/')
def test(test=None):
    if not test: test = 'nope'
    return test

def start():
    logreciever = logsetup()
    engine = enginer()
    app.config['SECRET_KEY'] = secrets.token_hex()
    app.config['SQLALCHEMY_DATABASE_URI'] = engine.url
    app.config['DB'] = SQLAlchemy(app)
    db = AccessDB(engine)

    Domain.setup()
    Zones.setup()

    if ConfData.general.autouser is True:
        db.create_zero_user()
    else:
        db.delete_user(id='-1')

    app.run(ConfData.general.listen,ConfData.general.port,debug=True)
    

if __name__ == "__main__":
    if loadconf() is True:
        start()