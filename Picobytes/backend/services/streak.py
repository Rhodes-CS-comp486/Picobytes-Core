import os
import sqlite3
from datetime import datetime
import time
from flask import jsonify
import psycopg
from psycopg.rows import dict_row
from db_info import *

class Streaks:
    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        #return psycopg.connect(self.db_url, row_factory=dict_row)
        return psycopg.connect(self.db_url)


    def update_streak(self, uid, time):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                       select ulastanswertime, ustreak from users where uid=%s
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

            cursor.execute("""UPDATE users SET ulastanswertime = %s, ustreak = %s WHERE id = ?""", (time, days, uid,))
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
                       select ustreak from users where uid=%s
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
                       select ulastanswertime, ustreak from users where uid=%s
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
                       select upoints from users where uid=%s
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

    def get_top_10(self):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            cursor.execute("""
                        SELECT uname, uid, upoints FROM users WHERE uadmin = 0 ORDER BY upoints DESC LIMIT 10;
                               """)
            top10 = cursor.fetchall()
            return jsonify({'top10': top10})
        except Exception as e:
            print(f"Error getting top 10: {e}")
            return jsonify({'error': 'error fetching top 10 users'})


