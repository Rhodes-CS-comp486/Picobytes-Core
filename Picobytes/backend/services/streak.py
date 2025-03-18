import os
import sqlite3


class Streaks:
    def __init__(self, db_filename="users.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)

    def update_streak(self, uid, time):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select ulastanswertime, streak from users where uid=?
                   """, (uid,))

            u = cursor.fetchone()

            last_time, days = u

            if time - last_time < 86400:
                days += 1
            else:
                days = 0

            cursor.execute("""UPDATE users SET ulastanswertime = ?, streak = ? WHERE id = ?""", (time, days, uid,))
            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response: {e}")
            return 0