from flask import redirect, render_template, session
from back.forms import LoginForm

def login_page():
    if "user_id" in session:
        return redirect('/')
    form = LoginForm()
    form.hidden_tag()
    return render_template('login.html.j2', action = hash("login"), form=form)