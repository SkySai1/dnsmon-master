
import logging
from back.accessdb import AccessDB
from flask import Flask, request
from psycopg2.errors import UniqueViolation
from back.functions import domain_validate
from back.object import BadName, Domain, Zones


def add_object(app:Flask, data:list, otype:str):
    try:
        db = AccessDB(app.config.get('DB').engine)
        if otype.lower() == 'd':
            result = []
            for d in data:
                if domain_validate(d.get('fqdn')) is BadName:
                    return ['fail'], 520
                response = db.new_domain(d)
                if response is UniqueViolation:
                    result.append(['exist', d.get('fqdn'), 520])
                else: result.append(response)
            return result
    except:
        return ['fail'], 520

def remove_object(app:Flask, indexes:str|list, otype:str):
    if type(indexes) is str: indexes = [indexes]
    db = AccessDB(app.config.get('DB').engine)
    result = []
    if otype.lower() == 'd':  
        for i in indexes:
            state = db.remove_domains(i)
            if type(state) is int:
                result.append(state)
    elif otype.lower() == 'z':  result = db.remove_zone(id)
    if result:
        return result
    else:
        return '', 520

def edit_object(app:Flask, data:list, otype:str):
    db = AccessDB(app.config.get('DB').engine)
    for one in data:
        if domain_validate(one.get('fqdn')) is BadName:
            return ['fail'], 520
        new = {
            'id': one.get('index'),
            'fqdn': one.get('fqdn'),
            'notify': one.get('notify'),
            'note': one.get('note')
        }
        result = db.update_domain(new)
    if result:
        return [result]
    else:
        return '', 520

def switch_object(app:Flask, domains:str|list, states:str|list, otype:str):
    if type(domains) is str: domains = [domains]
    if type(states) is str: states = [states]
    db = AccessDB(app.config.get('DB').engine)
    if otype.lower() == 'd':
        result = []
        for domain in domains:
            try: 
                state = states[domains.index(domain)]
            except:
                logging.error(f'Not specify state for domain {domain}', exc_info=(logging.DEBUG >= logging.root.level)) 
                return [''], 520
            result.append(db.switch_domain(state, fqdn=domain))
        if False in result:
            return ['fail'], 520

    #print(data, states)
    return ['']
    #if otype.lower() == 'd': result = db.switch_domain(state, fqdn=fqdn)
    #elif otype.lower() == 'z': result = db.switch_zone(state, fqdn=fqdn)  