import os
import sqlite3
from datetime import datetime


class Streaks:
    def __init__(self, db_filename="pico.db"):
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

            old_dt = datetime.fromtimestamp(last_time)

            new_dt = datetime.fromtimestamp(time)

            difference = new_dt - old_dt

            if difference.days == 0:
                print()
            elif difference.days == 1:
                days += 1
            elif difference.days > 1:
                days = 0

            cursor.execute("""UPDATE users SET ulastanswertime = ?, ustreak = ? WHERE id = ?""", (time, days, uid,))
            conn.commit()
            conn.close()
            return 1
        except Exception as e:
            print(f"Error saving response: {e}")
            return 0


    def get_streak(self, uid):
        try:
            print(f"Received uid: {uid}")
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select ustreak from users where uid=?
                   """, (uid,))

            streak = cursor.fetchone()

            conn.close()
            return streak
        except Exception as e:
            print(f"Error saving response: {e}")
            return -1
