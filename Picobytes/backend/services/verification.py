import os
import sqlite3


class Verification:
    def __init__(self, db_filename="users.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)


    def verify_user(self, uid):
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("""select * from users where uid = ?""", (uid,))
        user = cursor.fetchone()
        if user is None:
            return False
        else:
            return True

    def verify_admin(self, uid):
        conn = self._connect()
        cursor = conn.cursor()
        cursor.execute("""
                                select uadmin from users where uid = ?
                                """, (uid))
        result = cursor.fetchone()
        if result == 0:
            return False
        else:
            return True