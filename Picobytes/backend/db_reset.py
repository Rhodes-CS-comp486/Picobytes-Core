import sqlite3

########################################################
########################################################

####    CAREFUL! - THIS WILL DELETE THE DATABASE    ####

########################################################
########################################################


def reset_tables():
    try:

        # creating questions table
        connection = sqlite3.connect("../backend/qa.db")
        cursor = connection.cursor()

        cursor.execute("""
            DROP TABLE IF EXISTS questions;""")

        connection.commit()
        print("questions table dropped")

        # creating True/False Table
        cursor.execute("""
            DROP TABLE IF EXISTS true_false;""")

        connection.commit()

        print("true_false table dropped")

        # creating Multiple choice Table
        cursor.execute("""
            DROP TABLE IF EXISTS multiple_choice;""")

        connection.commit()
        connection.close()

        print("true_false table dropped")

    except Exception as e:
        print(f"Error dropping table: {e}")


if __name__ == "__main__":
    reset_tables()