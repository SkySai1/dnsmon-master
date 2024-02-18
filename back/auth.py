from flask import Flask, flash, redirect, request, session
from back.accessdb import AccessDB

def check_auth(app:Flask):
    if "user_id" in session:
        return
    elif request.path in ['/static/css/login.css']:
        return
    elif request.form.get('action') == str(hash("login")):
        user = request.form.get('username')
        passwd = request.form.get('password')
        if user and passwd:
            appdb = app.config.get('DB')
            db = AccessDB(appdb.engine)
            user_id = db.get_userid(user, passwd)
            if user_id: 
                session.update(user_id = user_id[0])
                return True
            else:
                flash('Пользователь не найден')
                return False
    else:
        return False