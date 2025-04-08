import sqlite3
import os
import string
import random
import time
import psycopg
from psycopg.rows import dict_row
from db_info import *


class UserFuncs:

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"


    ########################################
    ########## CREATING NEW USERS ##########
    ########################################

    def generate_unique_uid(self, cursor):
        while True:
            # Generate a random 10-character alphanumeric string
            uid = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            # Check if the UID already exists in the database
            cursor.execute("SELECT 1 FROM users WHERE uid = %s", (uid,))
            if not cursor.fetchone():
                return uid

    def add_user(self, uname, hashed_password, uemail, uadmin):
        try:
            connection = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")
            cursor = connection.cursor()

            # Generate a unique UID
            uid = self.generate_unique_uid(cursor)
            currtime = time.time()

            # Insert the new user
            cursor.execute("INSERT INTO users (uid, uname, uemail, upassword, ustreak, ulastanswertime, uincorrect, ucorrect, upoints, uadmin) VALUES (%s, %s, %s, %s, 1, %s, 0, 0, 0, %s)",
                           (uid, uname, uemail, hashed_password, currtime, uadmin))

            connection.commit()
            print(f"User {uname} added successfully with UID: {uid}")
            connection.close()
            return uid

        except Exception as e:
            print(f"Error adding user: {e}")
    
    def get_users(self):
        try:
            connection = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")
            cursor = connection.cursor()

            cursor.execute("SELECT uid, uname, uemail FROM users")

            names = cursor.fetchall()
            connection.close

            return names

        except Exception as e:
            print(f"Error fetching list of users: {e}")


    ##################################################
    ########## AUTHENTICATING CURRENT USERS ##########
    ##################################################

    def get_user_by_credentials(self, uname, hashed_password):
        connection = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")
        cursor = connection.cursor()
        
        # First check if the user exists
        cursor.execute("SELECT uid, upassword FROM users WHERE uname = %s", (uname,))
        user = cursor.fetchone()
        
        if not user:
            print(f"User not found in database: {uname}")
            connection.close()
            return None
            
        db_uid, db_password = user
        print(f"Database password hash: {db_password}")
        print(f"Provided password hash: {hashed_password}")
        
        if db_password == hashed_password:
            print(f"Password match: returning UID {db_uid}")
            connection.close()
            return db_uid
        else:
            print("Password mismatch")
            connection.close()
            return None
    


    ##################################################
    ##########        ADMIN CHECK           ##########
    ##################################################
    def is_admin(self, uid):
        """Check if a user is an admin"""
        if not uid:
            return False
        
        try:
            connection = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")
            cursor = connection.cursor()
            
            # Using the correct column name uadmin instead of is_admin
            cursor.execute("SELECT uadmin FROM users WHERE uid = %s", (uid,))
            result = cursor.fetchone()
            
            # Check if there's a result and if uadmin is 1
            is_admin = result[0]
            
            connection.close()
            return is_admin
            
        except Exception as e:
            print(f"Error checking admin status: {e}")
            return False

    def change_password(self, uname, hashed_password):
        try:
            connection = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")
            cursor = connection.cursor()

            cursor.execute("UPDATE users SET upassword = %s WHERE uname = %s", (hashed_password, uname))
            cursor.execute("select uid from users where uname = %s", (uname,))
            uid = cursor.fetchone()
            connection.commit()

            print(f"Successfully updated {uname}'s password")
            connection.close()
            return uid

        except Exception as e:
            print(f"Error adding user: {e}")
            return False
            


if __name__ == '__main__':
    service = UserFuncs()




