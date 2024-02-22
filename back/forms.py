from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, BooleanField, HiddenField, TextAreaField
from wtforms.validators import DataRequired
from back.object import Domain

class LoginForm(FlaskForm):
    username = StringField('Логин', validators=[DataRequired()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    submit = SubmitField('Войти')

class NewDomain(FlaskForm):
    domain = StringField('Домен', render_kw={"placeholder": "Добавить домен"})
    notify = StringField('Канал', render_kw={"placeholder": "Канал уведомлений"})
    note = TextAreaField('Примечание')

class NewZone(FlaskForm):
    zone = StringField('Зона', validators=[DataRequired()], render_kw={"placeholder": "Добавить зону"})

class DomainForm(FlaskForm):
    state = BooleanField('Статус')
    domain = StringField('Домен', validators=[DataRequired()])


    def __init__(self, name:str, formdata=None, **kwargs):
        super().__init__(formdata, **kwargs)
        self.domain.render_kw={"value":name}
        self.state.render_kw = {"checked":None}