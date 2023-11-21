import logging
import random, string
import re

def randomword(length) -> str:
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

def parse_list(rawdata):
   if rawdata:
      data = []
      for obj in rawdata:
         row = obj[0]
         data.append([row.fqdn, row.id, row.active])
      return data
   return []

def domain_validate(input:str):
   try:
      input = input.lower().encode('idna').decode().rstrip('.')
      if len(input) > 255 or len(input) < 1: return ''
      for label in input.split('.'):
         if len(label) > 64: return ''
         if not re.match(r'^[a-z]', label[0]): return ''
         for l in label:
            if not re.match(r'[a-z]|[0-9]|\-', l): return ''
         #if re.search(r'-{2,}', label): return ''
      input = input.encode().decode('idna')
      return input + '.'
   except:
      logging.debug(f"{input} is a bad DNS name", exc_info=(logging.DEBUG >= logging.root.level))
      return ''