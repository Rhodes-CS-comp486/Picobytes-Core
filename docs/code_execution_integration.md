# Coding Question Integration Guide

This document outlines how the Picobytes platform integrates with the Execute and Test team's code execution system.

## Overview

The integration allows students to:
- View coding questions
- Write and edit their code solutions
- Submit their code for execution and testing

The system handles:
- Converting code files and test cases to base64 before sending them to the execution service
- Storing coding questions with test cases in the database
- Saving users' code submissions

## Database Structure

The integration adds/modifies these tables:

1. `coding` - Stores coding questions, including:
   - `qid` - Question ID (foreign key to questions table)
   - `starter` - Starter code provided to students
   - `test_cases` - Test cases to evaluate the code against
   - `header_files` - Optional information about required header files

2. `user_coding` - Stores users' code submissions:
   - `uid` - User ID
   - `qid` - Question ID 
   - `code` - The user's submitted code
   - `execution_results` - Results from code execution (optional)

## API Endpoints

The integration adds these API endpoints:

1. `GET /api/coding/question/:qid` - Retrieves a coding question by ID
2. `POST /api/coding/submit` - Saves a user's code submission
3. `POST /api/coding/execute` - Executes a user's code against test cases
4. `POST /api/admin/add_coding_question` - Allows admins to add new coding questions

## Base64 Encoding

When code is submitted for execution, both the user's code and the test cases are converted to base64 format before being sent to the execution service. This ensures:

1. Safe transmission of potentially complex code with special characters
2. Consistent format for the execution service to work with
3. Compatibility with different programming languages

Example of encoding:
```python
import base64

# Encode code to base64
code_base64 = base64.b64encode(code.encode('utf-8')).decode('utf-8')

# Encode test cases to base64
test_cases_base64 = base64.b64encode(test_cases.encode('utf-8')).decode('utf-8')
```

## Frontend Components

The integration adds a new `CodingQuestion` component that provides:
- A code editor for students to write their solutions
- Buttons to save, execute, and reset code
- Display of execution results

## Adding Coding Questions

Administrators can add new coding questions through the API. Required fields:
- `question_text`: The problem description
- `topic`: The topic category
- `level`: Difficulty level
- `starter_code`: Initial code provided to students 
- `test_cases`: Test cases to verify the solution
- `header_files`: Optional information about required header files

## Integration with Execute and Test Team

The system prepares a payload containing:
- `code`: Base64-encoded user code
- `test_cases`: Base64-encoded test cases

This payload is then sent to the execution service endpoint.
