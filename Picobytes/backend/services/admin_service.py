# services/admin_service.py


from datetime import datetime, timedelta
from typing import Dict, List, Any
from services.analytics_service import AnalyticsService
import psycopg
from psycopg.rows import dict_row
from db_info import *
import random

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

    def get_activity_summary(self, time_range: str = "30d") -> Dict[str, Any]:
        """
        Get user activity summary data including daily, weekly, and monthly active users,
        along with session time and completion metrics.
        
        Args:
            time_range: The time range for which to fetch data (7d, 30d, 90d)
        """
        # For now, generate mock data since we don't have real session tracking yet
        # In a real implementation, this would query the database for actual metrics
        
        # Convert time_range to number of days for generating data
        days = 30  # default
        if time_range == "7d":
            days = 7
        elif time_range == "90d":
            days = 90
        
        # Generate daily active users data
        daily_active_users = []
        today = datetime.now().date()
        
        for i in range(days):
            day = today - timedelta(days=days-i-1)
            # Simulate some realistic patterns - weekends have fewer users
            modifier = 0.7 if day.weekday() >= 5 else 1.0
            count = int((80 + (i % 10) * 3 + random.randint(-5, 15)) * modifier)
            daily_active_users.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Generate weekly active users data
        weeks = days // 7 + (1 if days % 7 > 0 else 0)
        weekly_active_users = []
        
        for i in range(weeks):
            end_date = today - timedelta(days=i*7)
            # Each week has roughly 5x the daily average
            count = int(sum(item["count"] for item in daily_active_users[max(0, i*7):min(len(daily_active_users), (i+1)*7)]) * 0.8)
            weekly_active_users.append({
                "date": end_date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Generate monthly active users data
        months = days // 30 + (1 if days % 30 > 0 else 0)
        monthly_active_users = []
        
        for i in range(months):
            month_date = datetime(today.year, today.month, 1) - timedelta(days=i*30)
            # Each month has roughly 3x the weekly average
            count = int(sum(item["count"] for item in weekly_active_users[max(0, i*4):min(len(weekly_active_users), (i+1)*4)]) * 0.7)
            monthly_active_users.append({
                "date": month_date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Calculate other metrics
        total_questions = random.randint(3000, 8000)
        correct_answers = int(total_questions * (random.uniform(0.55, 0.85)))
        
        return {
            "daily_active_users": daily_active_users,
            "weekly_active_users": weekly_active_users,
            "monthly_active_users": monthly_active_users,
            "average_session_time": random.randint(8, 25),  # in minutes
            "total_questions_attempted": total_questions,
            "total_correct_answers": correct_answers
        }