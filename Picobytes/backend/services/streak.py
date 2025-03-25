import os
import sqlite3
from datetime import datetime
import time


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
                       select ulastanswertime, ustreak from users where uid=?
                   """, (uid,))

            u = cursor.fetchone()

            last_time, days = u

            old_dt = datetime.fromtimestamp(last_time)

            new_dt = datetime.fromtimestamp(time.time())

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
            # print(f"Received uid: {uid}")
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select ustreak from users where uid=?
                   """, (uid,))

            streak = cursor.fetchone()

            conn.close()
            return streak
        except Exception as e:
            print(f"Error getting streak: {e}")
            return -1

    def get_days_since_last_login(self, uid):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select ulastanswertime, ustreak from users where uid=?
                   """, (uid,))

            u = cursor.fetchone()

            conn.close()

            last_time, days = u

            old_dt = datetime.fromtimestamp(last_time)

            new_dt = datetime.fromtimestamp(time.time())

            difference = new_dt - old_dt
            
            return difference.days
        except Exception as e:
            print(f"Error fetching days since last login {e}")
            return -1

    def get_points(self, uid):
        try:
            print(f"Received uid: {uid}")
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select upoints from users where uid=?
                   """, (uid,))

            points = cursor.fetchone()

            conn.close()
            return points
        except Exception as e:
            print(f"getting streak: {e}")
            return -1



    def get_stats(self, uid):
        streak = self.get_streak(uid)
        points = self.get_points(uid)
        return (streak, points)

