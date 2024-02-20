
from flask import Flask, render_template, request

from back.accessdb import AccessDB
from back.forms import NewDomain
from back.functions import domain_validate, parse_list
from back.object import BadName, Domain
from back.worker import add_object, edit_object, remove_object, switch_object


def domains_page(app:Flask):
    if request.method == 'POST':
        appdb = app.config.get('DB')
        db = AccessDB(appdb.engine)
        data = db.get_domains()
        d_list = parse_list(data)
        return d_list
    else:
        form = NewDomain()
        return render_template(
            'domains.jinja', 
            form = form, 
            new = Domain.hash_new,
            remove = Domain.hash_mv,
            edit = Domain.hash_edit,
            switch = Domain.hash_switch
        )


def domains_action_worker(app:Flask, action):
    '''try:
        id = int(domain)
        domain = None
    except:
        id = None
        if not domain: return '', 500
        if domain == '*': domain = None
        else: 
            domain = domain_validate(domain)
            if domain is BadName:
                return 'badname', 520'''
    try:
        data = request.form.getlist('domains[]')
        for domain in data:
            if domain_validate(domain) is BadName:
                return ['badname'], 520
        if action == Domain.hash_new: 
            return add_object(app, data, 'd')
        elif action == Domain.hash_switch:
            states = request.form.getlist('states[]')
            return switch_object(app, data, states, 'd')
    except:
        return ['error'], 500   
    return '', 404