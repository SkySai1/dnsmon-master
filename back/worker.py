
from back.accessdb import AccessDB
from flask import Flask
from psycopg2.errors import UniqueViolation
from back.object import Domain, Zones


def add_object(app:Flask, fqdn, otype:str):
    db = AccessDB(app.config.get('DB').engine, app.config.get('CONF'))
    if not fqdn: return 'empty', 520
    if otype.lower() == 'd': 
        result = db.new_domain(fqdn)
        obj = Domain
    elif otype.lower() == 'z': 
        result = db.new_zone(fqdn)
        obj = Zones

    if result and type(result) is tuple:
        return {
            "object": result[1],
            "id": result[0],
            "remove": obj.hash_mv,  
            "edit": obj.hash_edit, 
            "switch": obj.hash_switch}
    elif result is UniqueViolation:
        return 'exist', 520
    else: 
        return 'fail', 520

def remove_object(app:Flask, id, otype:str):
    db = AccessDB(app.config.get('DB').engine, app.config.get('CONF'))
    if otype.lower() == 'd':  result = db.remove_domains(id)
    elif otype.lower() == 'z':  result = db.remove_zone(id)
    if result:
        return [result]
    else:
        return '', 520