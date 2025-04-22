import psycopg
from db_info import *

def add_sample_coding_questions():
    """Add sample coding questions to the database."""
    db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"
    
    try:
        # Connect to the database
        conn = psycopg.connect(db_url)
        cursor = conn.cursor()
        
        # Define the sample questions
        sample_questions = [
            {
                "qtext": "Write a function that reverses a string in-place",
                "qtype": "coding",
                "qlevel": "Medium",
                "qtopic": "Strings",
                "function_template": "void strrev(char *str) {\n    // Your code here\n}",
                "test_code": """
#include <stdio.h>
#include <string.h>
#include <assert.h>

// Test cases
int main() {
    // Test case 1: Basic string
    char str1[] = "hello";
    strrev(str1);
    assert(strcmp(str1, "olleh") == 0);
    
    // Test case 2: Empty string
    char str2[] = "";
    strrev(str2);
    assert(strcmp(str2, "") == 0);
    
    // Test case 3: Single character
    char str3[] = "a";
    strrev(str3);
    assert(strcmp(str3, "a") == 0);
    
    // Test case 4: Even length string
    char str4[] = "abcd";
    strrev(str4);
    assert(strcmp(str4, "dcba") == 0);
    
    printf("All tests passed!\\n");
    return 0;
}
""",
                "correctcode": """
void strrev(char *str) {
    if (str == NULL) return;
    
    // Get the length of the string
    int len = 0;
    while (str[len] != '\\0') {
        len++;
    }
    
    // Swap characters from start and end
    for (int i = 0, j = len - 1; i < j; i++, j--) {
        char temp = str[i];
        str[i] = str[j];
        str[j] = temp;
    }
}
"""
            },
            {
                "qtext": "Implement a function to find the maximum element in an array",
                "qtype": "coding",
                "qlevel": "Easy",
                "qtopic": "Arrays",
                "function_template": "int find_max(int arr[], int size) {\n    // Your code here\n}",
                "test_code": """
#include <stdio.h>
#include <assert.h>

int main() {
    // Test case 1: Basic array
    int arr1[] = {1, 3, 5, 2, 4};
    assert(find_max(arr1, 5) == 5);
    
    // Test case 2: Array with negative numbers
    int arr2[] = {-1, -3, -5, -2, -4};
    assert(find_max(arr2, 5) == -1);
    
    // Test case 3: Array with one element
    int arr3[] = {42};
    assert(find_max(arr3, 1) == 42);
    
    // Test case 4: Array with duplicate max
    int arr4[] = {10, 5, 10, 3, 7};
    assert(find_max(arr4, 5) == 10);
    
    printf("All tests passed!\\n");
    return 0;
}
""",
                "correctcode": """
int find_max(int arr[], int size) {
    if (size <= 0) return 0;
    
    int max = arr[0];
    for (int i = 1; i < size; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}
"""
            }
        ]
        
        # Insert each question
        for question in sample_questions:
            # First check if question already exists to avoid duplicates
            cursor.execute(
                "SELECT qid FROM questions WHERE qtext = %s AND qtype = 'coding'", 
                (question["qtext"],)
            )
            
            # Skip if question already exists
            if cursor.fetchone():
                print(f"Question '{question['qtext']}' already exists, skipping...")
                continue
            
            # Insert into questions table
            cursor.execute(
                """
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (%s, %s, %s, %s, %s) RETURNING qid
                """,
                (
                    question["qtext"], 
                    question["qtype"], 
                    question["qlevel"], 
                    question["qtopic"], 
                    True
                )
            )
            
            # Get the inserted question ID
            qid = cursor.fetchone()[0]
            
            # Insert into coding table
            cursor.execute(
                """
                INSERT INTO coding (qid, starter, testcases, correctcode)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    qid, 
                    question["function_template"],
                    question["test_code"],
                    question["correctcode"]
                )
            )
            
            print(f"Added question '{question['qtext']}' with ID {qid}")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("Sample coding questions added successfully")
        
    except Exception as e:
        print(f"Error adding sample coding questions: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    add_sample_coding_questions() 