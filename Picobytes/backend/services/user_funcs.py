import sqlite3
import os

class UserFuncs:

    def __init__(self, db_filename="users.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))



    def get_user_by_credentials(self, uname, hashed_password):
        conn = sqlite3.connect(self.db_path)  # Replace with your actual DB
        cursor = conn.cursor()
        cursor.execute("SELECT uid FROM users WHERE uname = ? AND upassword = ?", (uname, hashed_password))
        user = cursor.fetchone()
        conn.close()
        return user[0] if user else -1


if __name__ == '__main__':
    service = UserFuncs()
    user = service.get_user_by_credentials("bill", "hi")
    print(user)


