import os
import sqlite3
import psycopg
from psycopg.rows import dict_row
from Picobytes.backend.db_info import *



class Verification:
    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)


    def verify_user(self, uid):
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("""select * from users where uid = %s""", (uid,))
        user = cursor.fetchone()
        if user is None:
            return False
        else:
            return True

    def verify_admin(self, uid):
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("""
                                select uadmin from users where uid = %s
                                """, (uid))
        result = cursor.fetchone()
        if result == 0:
            return False
        else:
            return True