#!/etc/dnschecker-master/venv/bin/python3
import secrets
from datetime import datetime
from back.accessdb import AccessDB, enginer
from flask import Flask, flash, request, current_app, session, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from back.logger import logsetup
from initconf import getconf, loadconf
from back.forms import LoginForm, NewDomain, DomainForm
from back.object import Domain
from back.functions import parse_list, domain_validate
from psycopg2.errors import UniqueViolation

app = Flask(__name__)

@app.before_request
def pre_load():
    if "user_id" in session or True:
        pass
    elif request.form.get('action') == str(hash("login")):
        user = request.form.get('username')
        passwd = request.form.get('password')
        if user and passwd:
            appdb = app.config.get('DB')
            db = AccessDB(appdb.engine, CONF)
            user_id = db.get_userid(user, passwd)
            if user_id: 
                session.update(user_id = user_id[0])
                return redirect(request.url)
            else:
                flash('Пользователь не найден')
                return login()
    else:
        return login()
    pass

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html.j2'), 404

@app.errorhandler(405)
def page_not_found(e):
    return render_template('404.html.j2'), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html.j2'), 500

@app.route('/login', methods=['GET','POST'])
def login():
    if "user_id" in session:
        return redirect('/')
    form = LoginForm()
    form.hidden_tag()
    return render_template('login.html.j2', action = hash("login"), form=form)

@app.route('/')
def index():
    ua = request.headers.get('User-Agent')
    return render_template('index.html.j2', ua = ua, current_time=datetime.utcnow())

@app.route('/user/<name>')
def user(name):
    return '<h1>Hello, %s!</h1>' %  (name)

@app.route('/domains', methods=['GET','POST'])
def domains():
    appdb = app.config.get('DB')
    db = AccessDB(appdb.engine, CONF)
    data = db.get_domains()
    d_list = parse_list(data)
    form = NewDomain()
    return render_template(
        'domains.html.j2', 
        domains = d_list, 
        form = form, 
        new = Domain.hash_new,
        mv = Domain.hash_mv,
        edit = Domain.hash_edit,
        sw = Domain.hash_switch
    )

@app.route('/domains/<domain>/<action>', methods = ['POST'])
def new_domain(domain, action):
    domain = domain_validate(domain)
    if not domain: return '', 500

    if action == Domain.hash_new:
        db = AccessDB(app.config.get('DB').engine, CONF)
        result = db.new_domain(domain)
        if result and type(result) is str:
            return [result]
        elif result is UniqueViolation:
            return 'exist', 520
        else: 
            return 'fail', 520
        
    elif action == Domain.hash_mv:
        db = AccessDB(app.config.get('DB').engine, CONF)
        result = db.remove_domains(fqdn=domain)
        if result:
            return str(result)
        else:
            return '', 520
        
    elif action == Domain.hash_edit:
        input = request.form.get('new')
        new = domain_validate(input)
        if not new: return 'badname', 520
        db = AccessDB(app.config.get('DB').engine, CONF)
        result = db.update_domain(new, fqdn=domain)
        if result:
            return [result]
        else:
            return '', 520
        
    elif action == Domain.hash_switch:
        db = AccessDB(app.config.get('DB').engine, CONF)
        state = request.form.get('state')
        result = db.switch_domain(state, fqdn=domain)
        if result:
            return [result]
        else:
            return '', 520
    
    return '', 404


@app.route('/t/<test>/')
def test(test=None):
    if not test: test = 'nope'
    return test

def start():
    logreciever = logsetup(CONF)
    engine = enginer(CONF)
    app.config['SECRET_KEY'] = secrets.token_hex()
    app.config['SQLALCHEMY_DATABASE_URI'] = engine.url
    app.config['DB'] = SQLAlchemy(app)
    db = AccessDB(engine, CONF)

    Domain.setup()

    if eval(CONF['GENERAL']['autouser']):
        db.create_zero_user()
    else:
        db.delete_user(id='-1')

    app.run('0.0.0.0',5380,debug=True)
    

if __name__ == "__main__":
    CONF = loadconf()
    start()