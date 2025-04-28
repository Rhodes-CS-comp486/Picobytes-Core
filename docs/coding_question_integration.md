# Coding Question Integration

This document explains how the coding question feature is integrated with the execute-test service in the Picobytes-Core application.

## Overview

The Coding Question feature allows instructors to create C programming questions that can be automatically evaluated using the execute-test service. This integration provides real-time feedback to students on their code submissions, including compilation status, execution results, and test outcomes.

## Database Schema

Coding questions are stored in the following tables:

1. **questions** table:
   - `qid`: Question ID (primary key)
   - `qtext`: Question text/description
   - `qtype`: Set to 'coding' for coding questions
   - `qlevel`: Difficulty level (Easy, Medium, Hard)
   - `qtopic`: Topic category
   - `qactive`: Boolean indicating if the question is active

2. **coding** table:
   - `qid`: Question ID (foreign key to questions table)
   - `starter`: Template code provided to students
   - `testcases`: Test code used to validate submissions
   - `correctcode`: Reference solution

3. **user_coding** table (for storing student responses):
   - `uid`: User ID
   - `qid`: Question ID
   - `usercode`: The student's submitted code
   - `compile_status`: Status of compilation
   - `run_status`: Status of execution

## API Endpoints

### Fetch Coding Questions

- **GET /api/coding-questions**: Retrieve all coding questions
- **GET /api/coding-questions/:qid**: Retrieve a specific coding question by ID

### Submit Answers

- **POST /api/coding-questions/:qid/submit**: Submit a solution to a coding question (requires authentication)
- **POST /api/coding-questions/:qid/test**: Test a solution without recording it (for guest users)

## Code Execution Flow

1. Student submits code via the frontend
2. Backend receives the code through the API endpoint
3. The `CodingQuestionService` fetches the question details including test cases
4. The `CodeExecutionService` sends the code and test cases to the execute-test service
5. The execute-test service compiles and runs the code with the test cases
6. Results are returned to the frontend for display
7. The submission is recorded in the database if the student is authenticated

## Integration with execute-test Service

The integration with the execute-test service happens through the `CodeExecutionService`, which handles:

1. Sending code and test cases to the execute-test API
2. Handling responses, including special case handling for valgrind issues
3. Formatting the results for consumption by the frontend

## Testing the Integration

1. Run `add_sample_coding_question.py` to add sample questions to the database
2. Run the unit tests in `tests/test_coding_questions.py` to verify functionality
3. Use the test endpoint `/api/coding-questions/:qid/test` to manually test submissions

## Frontend Integration

The frontend displays coding questions using:

1. A code editor component for students to write their solutions
2. A submission button to evaluate the code
3. A results area to display compilation status, test results, and feedback

## Troubleshooting

If you encounter issues with the coding question functionality:

1. Check that the execute-test service is running (`CODE_EXECUTION_API_URL` in config.py)
2. Verify database connectivity and schema
3. Check the test cases for proper formatting
4. Look for detailed error messages in the logs

## Best Practices for Writing Test Cases

1. Include a variety of test cases that cover edge cases
2. Use assertions to check correctness
3. Provide appropriate error messages
4. Include test cases with different input sizes and values
5. Make use of the testing framework using the article about testing during live coding interviews 