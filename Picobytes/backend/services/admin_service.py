# services/admin_service.py

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any
from services.analytics_service import AnalyticsService

class AdminService:
    def __init__(self, db_path="pico.db"):
        self.db_path = db_path
        self.analytics_service = AnalyticsService()
    
    def _get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

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

    def log_user_activity(self, uid: str, activity_type: str = "login") -> bool:
        """
        Log user activity for tracking active users
        Args:
            uid: User ID
            activity_type: Type of activity (login, question_attempt, etc.)
        """
        conn = self._get_db_connection()
        try:
            conn.execute(
                "INSERT INTO analytics_user_activity (uid, activity_type) VALUES (?, ?)",
                (uid, activity_type)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error logging user activity: {e}")
            return False
        finally:
            conn.close()

    def get_active_users(self, period: str = "24h") -> Dict[str, Any]:
        """
        Get count of total users in the system
        """
        conn = self._get_db_connection()
        
        try:
            # Simply count all users in the users table
            cursor = conn.execute("SELECT COUNT(*) as user_count FROM users")
            
            result = cursor.fetchone()
            user_count = result['user_count'] if result else 0
            
            return {
                "active_users": user_count
            }
        except Exception as e:
            print(f"Error getting users count: {e}")
            return {
                "active_users": 0
            }
        finally:
            conn.close()

    def get_active_users_list(self, period: str = "24h"):
        """
        Get list of active users with their details
        Period can be: 24h, 7d, 30d
        """
        users = []
        conn = self._get_db_connection()
        
        try:
            print(f"DEBUG: Fetching active users list from database. Period: {period}")
            # Just return all users from the users table without filtering by activity period
            query = """
                SELECT 
                    uid,
                    uname as username,
                    uadmin
                FROM users
                ORDER BY uname
            """
            print(f"DEBUG: Executing query: {query}")
            cursor = conn.execute(query)
            
            for row in cursor:
                is_admin = row['uadmin'] == 1
                user = {
                    "uid": row['uid'],
                    "username": row['username'],
                    "last_active": "N/A",  # No activity tracking needed
                    "user_type": "Admin" if is_admin else "Student",
                    "is_admin": is_admin
                }
                users.append(user)
            
            print(f"DEBUG: Found {len(users)} users")
            
        except Exception as e:
            print(f"ERROR: Error getting users list: {e}")
            print(f"ERROR: Exception details: {str(e.__class__.__name__)}")
            import traceback
            print(f"ERROR: Traceback: {traceback.format_exc()}")
        
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