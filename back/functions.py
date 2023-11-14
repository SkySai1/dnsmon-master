import random, string

def randomword(length) -> str:
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))