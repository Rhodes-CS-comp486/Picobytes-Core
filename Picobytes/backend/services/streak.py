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
        conn = psycopg.connect(self.db_url)
        conn.row_factory = dict_row
        return conn


    def update_streak(self, uid, current_time):
        try:
            conn = self._connect()
            cursor = conn.cursor()
            
            # Calculate streak update in a single operation (PostgreSQL)
            cursor.execute("""
                UPDATE users 
                SET 
                    ustreak = CASE 
                        WHEN (EXTRACT(EPOCH FROM NOW()) - ulastanswertime) / 86400 < 1 THEN ustreak  -- Same day, no change
                        WHEN (EXTRACT(EPOCH FROM NOW()) - ulastanswertime) / 86400 < 2 THEN ustreak + 1  -- Next day, increment
                        ELSE 0  -- More than 1 day gap, reset to 0
                    END,
                    ulastanswertime = %s
                WHERE uid = %s
                RETURNING ustreak
            """, (current_time, uid))
            
            conn.commit()
            conn.close()
            return 1
            
        except Exception as e:
            print(f"Error updating streak: {e}")
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
            
            try:
                return streak['ustreak']
            except (TypeError, KeyError):
                return streak[0]
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

            try:
                last_time = u['ulastanswertime']
                days = u['ustreak']
            except (TypeError, KeyError):
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
            
            try:
                return points['upoints']
            except (TypeError, KeyError):
                return points[0]
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
            results = cursor.fetchall()
            conn.close()
            
            # Convert results to a list of dictionaries to ensure proper JSON serialization
            top10 = []
            for row in results:
                try:
                    # Try to access as dictionary
                    user_data = {
                        'uname': row['uname'],
                        'uid': row['uid'],
                        'upoints': row['upoints']
                    }
                except (TypeError, KeyError):
                    # If it's a tuple
                    user_data = {
                        'uname': row[0],
                        'uid': row[1],
                        'upoints': row[2]
                    }
                top10.append(user_data)
                
            return jsonify({'top10': top10})
        except Exception as e:
            print(f"Error getting top 10: {e}")
            return jsonify({'error': 'error fetching top 10 users'})


