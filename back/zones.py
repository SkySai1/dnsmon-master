from flask import Flask, render_template, request

from back.accessdb import AccessDB
from back.forms import NewZone
from back.functions import domain_validate, parse_list
from back.object import BadName, Zones
from back.worker import add_object


def zones_page(app:Flask):
    appdb = app.config.get('DB')
    db = AccessDB(appdb.engine)
    data = db.get_zones()
    z_list = parse_list(data)
    form = NewZone()
    if request.method == 'POST': return z_list
    return render_template(
        'zones.jinja', 
        zones = z_list, 
        form = form, 
        new = Zones.hash_new,
        remove = Zones.hash_mv,
        edit = Zones.hash_edit,
        switch = Zones.hash_switch
    )    

def zones_action_worker(app:Flask, zone, action):
    try:
        id = int(zone)
        zone = None
    except:
        id = None
        if not zone: return '', 500
        if zone == '*': zone = None
        else: 
            zone = domain_validate(zone)
            if zone is BadName:
                return 'badname', 520

    if action == Zones.hash_new: return add_object(app, zone, 'z')
    return