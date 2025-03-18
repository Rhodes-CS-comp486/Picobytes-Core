import sqlite3
from typing import Dict, List, Any
from datetime import datetime, timedelta

class AnalyticsService:
    def __init__(self, analytics_db_path="analytics.db", question_db_path="qa.db"):
        self.analytics_db_path = analytics_db_path
        self.question_db_path = question_db_path
    
    def _get_analytics_db_connection(self):
        conn = sqlite3.connect(self.analytics_db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _get_question_db_connection(self):
        conn = sqlite3.connect(self.question_db_path)
        conn.row_factory = sqlite3.Row
        return conn
        
    def record_question_attempt(self, qid: int, is_correct: bool) -> bool:
        """
        Record a question attempt in the analytics database
        """
        conn = self._get_analytics_db_connection()
        try:
            cursor = conn.execute(
                "INSERT INTO question_analytics (qid, is_correct) VALUES (?, ?)",
                (qid, is_correct)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error recording question attempt: {e}")
            return False
        finally:
            conn.close()
    
    def get_most_attempted_questions(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get the most attempted questions with their counts
        """
        analytics_conn = self._get_analytics_db_connection()
        question_conn = self._get_question_db_connection()
        
        result = []
        
        try:
            # Get question attempt counts
            cursor = analytics_conn.execute("""
                SELECT qid, COUNT(*) as attempts 
                FROM question_analytics 
                GROUP BY qid 
                ORDER BY attempts DESC
                LIMIT ?
            """, (limit,))
            
            attempt_data = cursor.fetchall()
            
            # Get question text for each qid
            for row in attempt_data:
                qid = row['qid']
                attempts = row['attempts']
                
                question_cursor = question_conn.execute(
                    "SELECT qtext FROM questions WHERE qid = ?", 
                    (qid,)
                )
                question_row = question_cursor.fetchone()
                
                if question_row:
                    result.append({
                        "id": qid,
                        "title": question_row['qtext'],
                        "attempts": attempts
                    })
            
            return result
            
        except Exception as e:
            print(f"Error getting most attempted questions: {e}")
            return []
        finally:
            analytics_conn.close()
            question_conn.close()
    
    def get_problematic_questions(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get questions with the lowest success rates
        """
        analytics_conn = self._get_analytics_db_connection()
        question_conn = self._get_question_db_connection()
        
        result = []
        
        try:
            # Get questions with at least 5 attempts, ordered by success rate
            cursor = analytics_conn.execute("""
                SELECT 
                    qid, 
                    COUNT(*) as attempts,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
                FROM question_analytics 
                GROUP BY qid 
                HAVING COUNT(*) >= 5
                ORDER BY success_rate ASC
                LIMIT ?
            """, (limit,))
            
            problematic_data = cursor.fetchall()
            
            # Get question text for each qid
            for row in problematic_data:
                qid = row['qid']
                attempts = row['attempts']
                success_rate = row['success_rate']
                
                question_cursor = question_conn.execute(
                    "SELECT qtext FROM questions WHERE qid = ?", 
                    (qid,)
                )
                question_row = question_cursor.fetchone()
                
                if question_row:
                    result.append({
                        "id": qid,
                        "title": question_row['qtext'],
                        "attempts": attempts,
                        "success_rate": round(success_rate, 1)
                    })
            
            return result
            
        except Exception as e:
            print(f"Error getting problematic questions: {e}")
            return []
        finally:
            analytics_conn.close()
            question_conn.close()
    
    def get_completion_stats(self) -> Dict[str, Any]:
        """
        Get overall completion rates and average scores
        """
        conn = self._get_analytics_db_connection()
        
        try:
            # Overall success rate
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as completion_rate
                FROM question_analytics 
            """)
            
            overall_stats = cursor.fetchone()
            completion_rate = round(overall_stats['completion_rate'], 1) if overall_stats else 0
            
            # Daily completions over the last 7 days
            daily_completions = []
            for i in range(6, -1, -1):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                start_time = f"{date} 00:00:00"
                end_time = f"{date} 23:59:59"
                
                cursor = conn.execute("""
                    SELECT COUNT(*) as count
                    FROM question_analytics
                    WHERE is_correct = 1
                    AND timestamp BETWEEN ? AND ?
                """, (start_time, end_time))
                
                count_row = cursor.fetchone()
                count = count_row['count'] if count_row else 0
                
                daily_completions.append({
                    "date": date,
                    "count": count
                })
            
            return {
                "completion_rate": completion_rate,
                "average_score": completion_rate,  # Using completion rate as the score for now
                "daily_completions": daily_completions
            }
            
        except Exception as e:
            print(f"Error getting completion stats: {e}")
            return {
                "completion_rate": 0,
                "average_score": 0,
                "daily_completions": []
            }
        finally:
            conn.close() 