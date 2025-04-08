import sqlite3
from typing import Dict, List, Any
from datetime import datetime, timedelta
import psycopg
from psycopg.rows import dict_row
from db_info import *
class AnalyticsService:
    '''def __init__(self, db_path="pico.db",):
        self.db_path = db_path

    
    def _get_db_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn'''

    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _get_db_connection(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url, row_factory=dict_row)
    

        
    def record_question_attempt(self, qid: int, is_correct: bool, uid: str) -> bool:
        """
        Record a question attempt in the analytics database
        
        Args:
            qid: Question ID
            is_correct: Whether the answer was correct
            uid: User ID (optional)
        """
        conn = self._get_db_connection()
        try:
            cursor = conn.cursor()
            # If timestamp is auto-generated in the database schema, we don't need to include it
            cursor.execute(
                "INSERT INTO question_analytics (qid, uid, is_correct) VALUES (%s, %s, %s)",
                (qid, uid, is_correct)
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
        conn = self._get_db_connection()
        
        result = []
        
        try:
            # Get question attempt counts
            cursor = conn.execute("""
                SELECT qid, COUNT(*) as attempts 
                FROM question_analytics 
                GROUP BY qid 
                ORDER BY attempts DESC
                LIMIT %s
            """, (limit,))
            
            attempt_data = cursor.fetchall()
            
            # Get question text for each qid
            for row in attempt_data:
                qid = row['qid']
                attempts = row['attempts']
                
                question_cursor = conn.execute(
                    "SELECT qtext FROM questions WHERE qid = %s", 
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
            conn.close()
    
    def get_problematic_questions(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get questions with the lowest success rates
        """
        conn = self._get_db_connection()
        
        result = []
        
        try:
            # Get questions with at least 5 attempts, ordered by success rate
            cursor = conn.execute("""
                SELECT 
                    qid, 
                    COUNT(*) as attempts,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
                FROM question_analytics 
                GROUP BY qid 
                HAVING COUNT(*) >= 5
                ORDER BY success_rate ASC
                LIMIT %s
            """, (limit,))
            
            problematic_data = cursor.fetchall()
            
            # Get question text for each qid
            for row in problematic_data:
                qid = row['qid']
                attempts = row['attempts']
                success_rate = row['success_rate']
                
                question_cursor = conn.execute(
                    "SELECT qtext FROM questions WHERE qid = %s", 
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
            conn.close()

    
    def get_completion_stats(self) -> Dict[str, Any]:
        """
        Get overall completion rates and average scores
        """
        conn = self._get_db_connection()
        
        try:
            # Overall success rate
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as completion_rate
                FROM question_analytics 
            """)
            
            overall_stats = cursor.fetchone()
            completion_rate = 0
            if overall_stats and overall_stats['completion_rate'] is not None:
                completion_rate = round(overall_stats['completion_rate'], 1)
            
            # Daily completions over the last 7 days
            daily_completions = []
            for i in range(6, -1, -1):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                start_time = f"{date} 00:00:00"
                end_time = f"{date} 23:59:59"
                
                cursor = conn.execute("""
                    SELECT COUNT(*) as count
                    FROM question_analytics
                    WHERE is_correct = TRUE
                    AND timestamp BETWEEN %s AND %s
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