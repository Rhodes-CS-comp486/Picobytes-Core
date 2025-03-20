import sqlite3
from services.user_funcs import UserFuncs
import hashlib


def populate_users():
    user_service = UserFuncs()
    uname1 = 'Will'
    upass1 = 'testing'
    uadmin1 = 0
    hashed_password1 = hashlib.sha256(upass1.encode()).hexdigest()



    uname2 = 'Matt'
    upass2 = 'iliketheory'
    uadmin2 = 1
    hashed_password2 = hashlib.sha256(upass2.encode()).hexdigest()


    user_service.add_user(uname1, hashed_password1, uadmin1)
    user_service.add_user(uname2, hashed_password2, uadmin2)




if __name__ == "__main__":
    populate_users()