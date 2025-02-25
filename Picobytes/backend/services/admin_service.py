from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import sqlite3
import json

class AdminService:
    def __init__(self, db_path="database.db"):
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
        
        # Get active users (users who have logged in since the cutoff)
        cursor = conn.execute(
            "SELECT COUNT(DISTINCT uid) as count FROM user_sessions WHERE login_time >= ?", 
            (cutoff_str,)
        )
        
        result = cursor.fetchone()
        active_count = result['count'] if result else 0
        
        conn.close()
        
        return {
            "active_users": active_count,
            "period": period
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get student performance metrics including completion rates and average scores
        """
        conn = self._get_db_connection()
        
        # Get total number of students
        cursor = conn.execute("SELECT COUNT(*) as count FROM users WHERE user_type = 0")
        result = cursor.fetchone()
        total_students = result['count'] if result else 0
        
        # Get number of students who have completed at least one quiz/module
        cursor = conn.execute(
            "SELECT COUNT(DISTINCT uid) as count FROM user_answers"
        )
        result = cursor.fetchone()
        completed_count = result['count'] if result else 0
        
        # Calculate completion rate
        completion_rate = 0 if total_students == 0 else (completed_count / total_students) * 100
        
        # Get average scores
        cursor = conn.execute(
            "SELECT AVG(score) as avg_score FROM user_quiz_results"
        )
        result = cursor.fetchone()
        avg_score = result['avg_score'] if result and result['avg_score'] is not None else 0
        
        # Get daily completions for the last 7 days
        daily_completions = []
        today = datetime.now().date()
        
        for i in range(7):
            day = today - timedelta(days=i)
            start_date = day.strftime("%Y-%m-%d 00:00:00")
            end_date = day.strftime("%Y-%m-%d 23:59:59")
            
            cursor = conn.execute(
                "SELECT COUNT(*) as count FROM user_quiz_results WHERE completion_time BETWEEN ? AND ?",
                (start_date, end_date)
            )
            result = cursor.fetchone()
            count = result['count'] if result else 0
            
            daily_completions.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": count
            })
        
        conn.close()
        
        return {
            "completion_rate": round(completion_rate, 2),
            "average_score": round(avg_score, 2),
            "daily_completions": daily_completions
        }
    
    def get_question_stats(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get statistics about most attempted and problematic questions
        """
        conn = self._get_db_connection()
        
        # Get most attempted questions
        cursor = conn.execute("""
            SELECT q.qid, q.qtext, COUNT(ua.uid) as attempt_count
            FROM questions q
            LEFT JOIN user_answers ua ON q.qid = ua.qid
            GROUP BY q.qid
            ORDER BY attempt_count DESC
            LIMIT 10
        """)
        
        most_attempted = []
        for row in cursor.fetchall():
            most_attempted.append({
                "id": row['qid'],
                "title": row['qtext'],
                "attempts": row['attempt_count']
            })
        
        # Get problematic questions (lowest success rate)
        cursor = conn.execute("""
            SELECT 
                q.qid, 
                q.qtext, 
                COUNT(ua.uid) as attempt_count,
                SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
            FROM questions q
            LEFT JOIN user_answers ua ON q.qid = ua.qid
            GROUP BY q.qid
            HAVING attempt_count > 5
            ORDER BY (CAST(correct_count as FLOAT) / attempt_count) ASC
            LIMIT 10
        """)
        
        problematic = []
        for row in cursor.fetchall():
            success_rate = 0 if row['attempt_count'] == 0 else (row['correct_count'] / row['attempt_count']) * 100
            problematic.append({
                "id": row['qid'],
                "title": row['qtext'],
                "attempts": row['attempt_count'],
                "success_rate": round(success_rate, 2)
            })
        
        conn.close()
        
        return {
            "most_attempted": most_attempted,
            "problematic": problematic
        }
    
    def get_usage_stats(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get usage statistics including daily and weekly active users
        """
        conn = self._get_db_connection()
        today = datetime.now().date()
        
        # Get daily active users for the past 30 days
        daily_users = []
        for i in range(30):
            day = today - timedelta(days=i)
            start_date = day.strftime("%Y-%m-%d 00:00:00")
            end_date = day.strftime("%Y-%m-%d 23:59:59")
            
            cursor = conn.execute(
                "SELECT COUNT(DISTINCT uid) as count FROM user_sessions WHERE login_time BETWEEN ? AND ?",
                (start_date, end_date)
            )
            result = cursor.fetchone()
            count = result['count'] if result else 0
            
            daily_users.append({
                "date": day.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Get weekly active users for the past 12 weeks
        weekly_users = []
        for i in range(12):
            week_end = today - timedelta(days=i*7)
            week_start = week_end - timedelta(days=6)
            start_date = week_start.strftime("%Y-%m-%d 00:00:00")
            end_date = week_end.strftime("%Y-%m-%d 23:59:59")
            
            cursor = conn.execute(
                "SELECT COUNT(DISTINCT uid) as count FROM user_sessions WHERE login_time BETWEEN ? AND ?",
                (start_date, end_date)
            )
            result = cursor.fetchone()
            count = result['count'] if result else 0
            
            weekly_users.append({
                "week": f"{week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}",
                "count": count
            })
        
        conn.close()
        
        return {
            "daily_users": daily_users,
            "weekly_users": weekly_users
        }