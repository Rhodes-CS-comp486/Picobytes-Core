import sqlite3
def pull_questions():
    try:
        conn = sqlite3.connect('../backend/qa.db')
        c = conn.cursor()

        c.execute('SELECT * FROM tf_questions')
        questions = c.fetchall()

        conn.close()
        return questions
    
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return []
    
if __name__ == '__main__':
    questions = pull_questions()
    for question in questions:
        print(question)   

