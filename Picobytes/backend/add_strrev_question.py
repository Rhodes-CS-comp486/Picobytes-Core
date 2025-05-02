#!/usr/bin/env python3
import psycopg
import sys
import os

# Add parent directory to path to import db_info
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db_info import *

def add_strrev_question():
    """Add the string reversal question from the PDF to the database."""
    db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"
    
    try:
        # Connect to the database
        conn = psycopg.connect(db_url)
        cursor = conn.cursor()
        
        # Define the string reversal question with the exact format requested
        strrev_question = {
            "qtext": """# Instructions

Provide an implementation for the `strrev()` function, which is described in the man(ual) page given below.

# NAME

    `strrev` - reverse a string

# SYNOPSIS

    `void strrev(char *dest, const char *src);`

# DESCRIPTION

    Copies the reverse of the string `src` into the buffer `dest`. The buffer `dest` must be large enough to hold the reversed string, including the null terminator. The function does not return a value.

# RETURN VALUE

    None. The reversed string is stored in `dest`.""",
            "qtype": "coding",
            "qlevel": "Medium",
            "qtopic": "Strings",
            "function_template": """void strrev(char *dest, const char *src) {
  // Your code here... 
}""",
            "test_code": """#include <string.h>
            #include <stdio.h>
            #include <assert.h>
 
// prototype for function under test 
void strrev(char *dest, const char *src); 
 
void do_test(char *input, char *expected) { 
  char actual[256]; 
 
  strrev(actual, input); 
  assert(strcmp(expected, actual) == 0); 
} 
 
void run_tests() { 
  do_test("", ""); 
  do_test("!", "!"); 
   
  /* non-palindromic strings */ 
  do_test("o_O", "O_o");   
  do_test("live", "evil"); 
 
  /* palindromic strings */ 
  do_test("tacocat", "tacocat"); 
  do_test("step on no pets", "step on no pets"); 
  
  printf("All tests passed!\\n");
}""",
            "correctcode": """#include <string.h> 
 
void strrev(char *dest, const char *src) { 
  int len = strlen(src); 
  for (int i = 0; i < len; i++) { 
    dest[i] = src[len - i - 1]; 
  } 
  dest[len] = '\\0'; 
}"""
        }
        
        # First check if question already exists to avoid duplicates
        cursor.execute(
            "SELECT qid FROM questions WHERE qtype = 'coding' AND qtopic = 'Strings' AND qtext LIKE '%strrev%'", 
        )
        
        existing_qid = cursor.fetchone()
        
        if existing_qid:
            qid = existing_qid[0]
            print(f"String reversal question already exists with ID {qid}.")
            
            # Ask if user wants to update it
            update = input("Do you want to update the existing question? (y/n): ")
            if update.lower() != 'y':
                print("Skipping update.")
                conn.close()
                return
                
            # Update the existing question
            cursor.execute(
                """
                UPDATE questions 
                SET qtext = %s, qlevel = %s, qtopic = %s, qactive = TRUE
                WHERE qid = %s
                """,
                (
                    strrev_question["qtext"],
                    strrev_question["qlevel"],
                    strrev_question["qtopic"],
                    qid
                )
            )
            
            # Update the coding table
            cursor.execute(
                """
                UPDATE coding
                SET starter = %s, testcases = %s, correctcode = %s
                WHERE qid = %s
                """,
                (
                    strrev_question["function_template"],
                    strrev_question["test_code"],
                    strrev_question["correctcode"],
                    qid
                )
            )
            
            print(f"Updated string reversal question with ID {qid}")
        else:
            # Insert into questions table
            cursor.execute(
                """
                INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive)
                VALUES (%s, %s, %s, %s, %s) RETURNING qid
                """,
                (
                    strrev_question["qtext"], 
                    strrev_question["qtype"], 
                    strrev_question["qlevel"], 
                    strrev_question["qtopic"], 
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
                    strrev_question["function_template"],
                    strrev_question["test_code"],
                    strrev_question["correctcode"]
                )
            )
            
            print(f"Added string reversal question with ID {qid}")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("String reversal question added/updated successfully")
        
    except Exception as e:
        print(f"Error adding string reversal question: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    add_strrev_question() 