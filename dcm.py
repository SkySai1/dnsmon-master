#!/etc/dnschecker-master/venv/bin/python3
import secrets
from datetime import datetime
from back.accessdb import AccessDB, enginer
from flask import Flask, flash, request, current_app, session, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from back.logger import logsetup
from initconf import getconf, loadconf
from back.forms import LoginForm

app = Flask(__name__)

@app.before_request
def pre_load():
    if "user_id" in session:
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

@app.route('/t')
def test():
    r = 'Test'
    appdb = app.config.get('DB')
    db = AccessDB(appdb.engine, CONF)
    d = db.get_geobase()
    r = []
    for obj in d:
        row = obj[0]
        r.append((row.ip, row.country, row.city))
    return r

def start():
    logreciever = logsetup(CONF)
    engine = enginer(CONF)
    app.config['SECRET_KEY'] = secrets.token_hex()
    app.config['SQLALCHEMY_DATABASE_URI'] = engine.url
    app.config['DB'] = SQLAlchemy(app)
    db = AccessDB(engine, CONF)
    if eval(CONF['GENERAL']['autouser']):
        db.create_zero_user()
    else:
        db.delete_user(id='-1', name='admin')
    
    app.run('0.0.0.0',5380,debug=True)
    

if __name__ == "__main__":
    CONF = loadconf()
    start()