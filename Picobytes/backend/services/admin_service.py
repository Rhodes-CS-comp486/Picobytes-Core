# services/admin_service.py

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any
from services.analytics_service import AnalyticsService
import psycopg
from psycopg.rows import dict_row
from Picobytes.backend.db_info import *

class AdminService:
    '''def __init__(self, db_path="pico.db"):
        self.db_path = db_path
        self.analytics_service = AnalyticsService()
    
    def _get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn'''

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"
        self.analytics_service = AnalyticsService()

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)


    def update_user_admin_status(self, uid, is_admin):
        conn = self._get_db_connection()
        try:
            # Convert boolean to integer for SQLite
            admin_value = 1 if is_admin else 0
            
            # Update the user's admin status
            cursor = conn.execute(
                "UPDATE users SET uadmin = ? WHERE uid = ?",
                (admin_value, uid)
            )
            conn.commit()
            
            # Check if any rows were affected
            success = cursor.rowcount > 0
            
            return success
        except Exception as e:
            print(f"Error updating user admin status: {e}")
            return False
        finally:
            conn.close()

    # Added debug prints to both methods to understand what's happening
    def get_active_users(self, period: str = "24h") -> Dict[str, Any]:
        """
        Get count of active users within a specified time period
        Period can be: 24h, 7d, 30d
        """
        conn = self._get_db_connection()
        
        # Debug: Check what we have in the users table
        cursor = conn.execute("SELECT COUNT(*) as count FROM users")
        result = cursor.fetchone()
        total_users = result['count'] if result else 0
        print(f"DEBUG - Total users in database: {total_users}")
        
        # For now, simply return all users as the active count
        # Since we don't have timestamp data
        active_count = total_users
        
        conn.close()
        
        return {
            "active_users": active_count,
            "period": period
        }

    # Update the get_active_users_list method to include is_admin flag
    def get_active_users_list(self, period: str = "24h"):
        """
        Get list of all users with their details
        """
        users = []
        conn = self._get_db_connection()
        
        try:
            # Directly execute the most basic query possible
            cursor = conn.execute("SELECT uid, uname, uadmin FROM users")
            
            # Convert rows to list of dictionaries
            for row in cursor:
                is_admin = row[2] == 1  # uadmin column
                user = {
                    "uid": row[0],             # First column: uid
                    "username": row[1],        # Second column: uname
                    "last_active": "N/A",      # We don't have timestamp data
                    "user_type": "Admin" if is_admin else "Student",  # Based on uadmin
                    "is_admin": is_admin       # Add direct boolean flag
                }
                users.append(user)
                
        except Exception as e:
            print(f"Error getting users: {e}")
            
        conn.close()
        return users


    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get student performance metrics including completion rates and average scores
        """
        return self.analytics_service.get_completion_stats()
    
    def get_question_stats(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get statistics about most attempted and problematic questions.
        Always fetches fresh data directly from the database.
        """
        # Force fresh data to be fetched from the database
        most_attempted = self.analytics_service.get_most_attempted_questions(5)
        problematic = self.analytics_service.get_problematic_questions(5)
        
        # If there's no data yet, provide minimal placeholder data
        if not most_attempted:
            most_attempted = [{"id": 0, "title": "No questions attempted yet", "attempts": 0}]
        if not problematic:
            problematic = [{"id": 0, "title": "No problematic questions yet", "attempts": 0, "success_rate": 0.0}]
            
        return {
            "most_attempted": most_attempted,
            "problematic": problematic
        }
    
    def get_usage_stats(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get usage statistics including daily and weekly active users
        """
        # For now, return dummy data
        # You can implement real database queries based on your schema
        return {
            "daily_users": self._generate_dummy_daily_users(),
            "weekly_users": self._generate_dummy_weekly_users()
        }
    
    def _generate_dummy_daily_users(self):
        # Generate 30 days of dummy data
        result = []
        today = datetime.now().date()
        
        for i in range(30):
            day = today - timedelta(days=i)
            count = 80 + (i % 5) * 10  # Just some variation
            result.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": count
            })
            
        return result
    
    def _generate_dummy_weekly_users(self):
        # Generate 12 weeks of dummy data
        result = []
        today = datetime.now().date()
        
        for i in range(12):
            end_date = today - timedelta(days=i*7)
            start_date = end_date - timedelta(days=6)
            count = 300 + (i % 4) * 50  # Just some variation
            
            result.append({
                "week": f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}",
                "count": count
            })
            
        return result