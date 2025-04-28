#!/usr/bin/env python3

import sys
import os
import json

# Add the necessary paths for imports
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "Picobytes", "backend"))
from services.coding_question_service import CodingQuestionService

def test_factorial_validation():
    """Test that our validation logic properly detects empty factorial implementations."""
    print("=" * 60)
    print("TESTING FACTORIAL VALIDATION")
    print("=" * 60)
    
    # Create an instance of the service
    service = CodingQuestionService()
    
    # Find the factorial question ID
    questions = service.get_coding_questions()
    factorial_qid = None
    
    for q in questions:
        if "factorial" in q.get("qtext", "").lower():
            factorial_qid = q["qid"]
            print(f"Found factorial question with ID: {factorial_qid}")
            break
    
    if not factorial_qid:
        print("Error: Could not find factorial question in the database")
        return False
    
    # Test cases
    test_cases = [
        {
            "name": "Empty implementation",
            "code": """
long factorial(int n) {
    // Empty implementation
}
""",
            "should_pass": False
        },
        {
            "name": "Only return statement",
            "code": """
long factorial(int n) {
    return 0;
}
""",
            "should_pass": False
        },
        {
            "name": "Recursive implementation",
            "code": """
long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
""",
            "should_pass": True
        },
        {
            "name": "Iterative implementation",
            "code": """
long factorial(int n) {
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
""",
            "should_pass": True
        }
    ]
    
    # Run the tests
    success = True
    for test in test_cases:
        print(f"\nTesting: {test['name']}")
        print(f"Code:\n{test['code']}")
        
        # Validate the submission
        result = service.validate_coding_submission(factorial_qid, test["code"])
        
        # Check if the result matches expectation
        is_correct = result.get("is_correct", False)
        expected = test["should_pass"]
        
        if is_correct == expected:
            print(f"✅ PASS: Got {'correct' if is_correct else 'incorrect'} as expected")
        else:
            print(f"❌ FAIL: Expected {'correct' if expected else 'incorrect'} but got {'correct' if is_correct else 'incorrect'}")
            success = False
        
        # Print execution results
        if "execution_results" in result:
            print("\nExecution results:")
            print(json.dumps(result["execution_results"], indent=2))
    
    print("\n" + "=" * 60)
    print(f"TEST RESULTS: {'PASS' if success else 'FAIL'}")
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    test_factorial_validation() 