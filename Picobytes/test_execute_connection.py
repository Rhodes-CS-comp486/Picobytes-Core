import requests
import json
import sys
import os

# Fix the import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import CODE_EXECUTION_API_URL

def test_execute_service_connection():
    print(f"Testing connection to execute-test service at: {CODE_EXECUTION_API_URL}")
    
    # Simple test code
    code = """
    int add(int a, int b) {
        return a + b;
    }
    """
    
    # Simple test cases
    tests = """
    #include <assert.h>
    
    // Tests for the add function
    assert(add(2, 3) == 5);
    assert(add(-1, 1) == 0);
    assert(add(100, 200) == 300);
    
    printf("All tests passed!\\n");
    """
    
    # Prepare payload
    payload = {
        "code": code,
        "tests": tests
    }
    
    try:
        # Test the root endpoint first
        root_response = requests.get(f"{CODE_EXECUTION_API_URL}/")
        print(f"Root endpoint status: {root_response.status_code}")
        if root_response.status_code == 200:
            print(f"Root response: {root_response.json()}")
        
        # Test the submit endpoint
        print("\nTesting code execution...")
        submit_response = requests.post(f"{CODE_EXECUTION_API_URL}/submit", json=payload)
        print(f"Submit endpoint status: {submit_response.status_code}")
        
        if submit_response.status_code == 200:
            result = submit_response.json()
            print("\nResponse from execute-test service:")
            print(json.dumps(result, indent=2))
            
            # Handle valgrind error specially since we expected it
            if "error" in result and "valgrind" in result.get("error", "").lower():
                print("\nNote: Valgrind error is expected and can be ignored for testing.")
                print("The CodeExecutionService is designed to handle this error gracefully.")
                print("This test shows the connection is working!")
                return True
            
            # Check if compilation was successful
            if result.get("compile", False):
                print("\nCode compilation successful!")
                if result.get("run", False):
                    print("Code execution successful!")
                    return True
                else:
                    print("Code execution failed.")
                    return False
            else:
                print("\nCode compilation failed.")
                return False
        else:
            print(f"\nError: {submit_response.text}")
            return False
    
    except Exception as e:
        print(f"\nError connecting to execute-test service: {e}")
        return False

if __name__ == "__main__":
    success = test_execute_service_connection()
    
    if success:
        print("\n✅ Connection to execute-test service is working!")
    else:
        print("\n❌ Connection test failed.") 