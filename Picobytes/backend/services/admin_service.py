# services/admin_service.py

import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any

class AdminService:
    def __init__(self, db_path="users.db"):
        self.db_path = db_path
    
    def _get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_active_users(self, period: str = "24h") -> Dict[str, Any]:
        """
        Get count of active users within a specified time period
        Period can be: 24h, 7d, 30d
        """
        conn = self._get_db_connection()
        now = datetime.now()
        
        if period == "24h":
            cutoff = now - timedelta(hours=24)
        elif period == "7d":
            cutoff = now - timedelta(days=7)
        elif period == "30d":
            cutoff = now - timedelta(days=30)
        else:
            cutoff = now - timedelta(hours=24)  # Default
        
        cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")
        
        # Check if the last_login column exists in the users table
        cursor = conn.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Get active users based on available columns
        if "last_login" in columns:
            # If there's a last_login column, use it
            cursor = conn.execute(
                "SELECT COUNT(*) as count FROM users WHERE last_login >= ?", 
                (cutoff_str,)
            )
        elif "last_active" in columns:
            # Alternative column name
            cursor = conn.execute(
                "SELECT COUNT(*) as count FROM users WHERE last_active >= ?", 
                (cutoff_str,)
            )
        else:
            # If no timestamp columns, count all users
            # You should modify this based on your actual schema
            cursor = conn.execute("SELECT COUNT(*) as count FROM users")
            
        result = cursor.fetchone()
        active_count = result["count"] if result else 0
        
        # As a backup, if user login data isn't available,
        # check if you have a user_sessions table
        try:
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_sessions'")
            has_sessions_table = cursor.fetchone() is not None
            
            if has_sessions_table:
                cursor = conn.execute(
                    "SELECT COUNT(DISTINCT uid) as count FROM user_sessions WHERE login_time >= ?", 
                    (cutoff_str,)
                )
                result = cursor.fetchone()
                if result and result["count"] > 0:
                    active_count = result["count"]
        except:
            # Ignore if the sessions table doesn't exist
            pass
            
        conn.close()
        
        return {
            "active_users": active_count,
            "period": period
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get student performance metrics including completion rates and average scores
        """
        # For now, return dummy data
        # You can implement real database queries based on your schema
        return {
            "completion_rate": 68.5,
            "average_score": 72.3,
            "daily_completions": [
                {"date": "2025-02-19", "count": 24},
                {"date": "2025-02-20", "count": 31},
                {"date": "2025-02-21", "count": 18},
                {"date": "2025-02-22", "count": 12},
                {"date": "2025-02-23", "count": 9},
                {"date": "2025-02-24", "count": 27},
                {"date": "2025-02-25", "count": 35}
            ]
        }
    
    def get_question_stats(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get statistics about most attempted and problematic questions
        """
        # For now, return dummy data
        # You can implement real database queries based on your schema
        return {
            "most_attempted": [
                {"id": 1, "title": "What is the correct syntax for referring to an external script called \"script.js\"?", "attempts": 287},
                {"id": 2, "title": "How do you create a function in JavaScript?", "attempts": 245},
                {"id": 3, "title": "How to write an IF statement in JavaScript?", "attempts": 228},
                {"id": 4, "title": "How does a FOR loop start?", "attempts": 198},
                {"id": 5, "title": "What is the correct way to write a JavaScript array?", "attempts": 187}
            ],
            "problematic": [
                {"id": 15, "title": "Which event occurs when the user clicks on an HTML element?", "attempts": 124, "success_rate": 36.2},
                {"id": 23, "title": "How do you declare a JavaScript variable?", "attempts": 156, "success_rate": 42.8},
                {"id": 7, "title": "How do you round the number 7.25, to the nearest integer?", "attempts": 98, "success_rate": 47.3},
                {"id": 19, "title": "How can you add a comment in a JavaScript?", "attempts": 132, "success_rate": 51.9},
                {"id": 11, "title": "What is the correct JavaScript syntax to change the content of the HTML element below?", "attempts": 174, "success_rate": 54.1}
            ]
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