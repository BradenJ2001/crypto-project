import random
from datetime import datetime
now = datetime.now()
num - randonm.randint(1, 101)
with open('rand.txt', 'a') as f:
    f.write('{} - Your random number is {}\n'.format(now, num))