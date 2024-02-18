
from flask import Flask, render_template, request

from back.accessdb import AccessDB
from back.forms import NewDomain
from back.functions import domain_validate, parse_list
from back.object import BadName, Domain
from back.worker import add_object, edit_object, remove_object, switch_object


def domains_page(app:Flask):
    appdb = app.config.get('DB')
    db = AccessDB(appdb.engine)
    data = db.get_domains()
    d_list = parse_list(data)
    form = NewDomain()
    if request.method == 'POST':
        return d_list
    else:
        return render_template(
            'domains.html.j2', 
            domains = d_list, 
            form = form, 
            new = Domain.hash_new,
            remove = Domain.hash_mv,
            edit = Domain.hash_edit,
            switch = Domain.hash_switch
        )


def domains_action_worker(app:Flask, domain, action):
    try:
        id = int(domain)
        domain = None
    except:
        id = None
        if not domain: return '', 500
        if domain == '*': domain = None
        else: 
            domain = domain_validate(domain)
            if domain is BadName:
                return 'badname', 520

    if action == Domain.hash_new: return add_object(app, domain, 'd')
    elif action == Domain.hash_mv: return remove_object(app, id, 'd')
    elif action == Domain.hash_edit: return edit_object(app, domain, 'd') 
    elif action == Domain.hash_switch: return switch_object(app, domain, 'd')
    
    return '', 404