#!/usr/bin/env python3

import os
import sys
import json
import requests
import argparse
import subprocess
import time

"""
Setup and Test Code Execution Integration

This script:
1. Checks if the execute-test service is running
2. Runs integration tests
3. Displays status and recommendations
"""

def check_execute_test_service(url):
    """Check if the execute-test service is running."""
    try:
        response = requests.get(url)
        return response.status_code == 200
    except Exception:
        return False

def run_execute_test_service(execute_test_path):
    """Start the execute-test service in a new terminal window."""
    print(f"Starting execute-test service from {execute_test_path}...")
    
    # On macOS, use osascript to open a new terminal
    if sys.platform == 'darwin':
        script = f'''
        tell application "Terminal"
            do script "cd {execute_test_path} && python3 api/server_api.py"
        end tell
        '''
        os.system(f"osascript -e '{script}'")
    else:
        print("Automatic startup not supported on this OS.")
        print(f"Please start the service manually with: cd {execute_test_path} && python3 api/server_api.py")
    
    # Wait for the service to start
    print("Waiting for execute-test service to start...")
    for _ in range(10):
        if check_execute_test_service("http://localhost:5000"):
            print("✅ execute-test service is running")
            return True
        time.sleep(1)
    
    print("❌ execute-test service did not start in time")
    return False

def check_server_response(url):
    """Make a direct API call to verify the server responds correctly."""
    print("\nTesting server response format...")
    
    # Simple test code
    code = """
    void test_function() {
        // Empty function
    }
    """
    
    tests = """
    // Call the test function
    test_function();
    return 0;
    """
    
    payload = {
        "code": code,
        "tests": tests,
        "timeout": 5,
        "perTestTimeout": 1
    }
    
    try:
        response = requests.post(f"{url}/submit", json=payload)
        if response.status_code == 200:
            result = response.json()
            print(f"Server response format: {json.dumps(result, indent=2)}")
            return True
        else:
            print(f"❌ Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Request error: {e}")
        return False

def run_integration_tests():
    """Run the integration tests."""
    print("\nRunning integration tests...")
    
    # Run the direct API test first
    print("\n1. Testing direct API connection...")
    result = subprocess.run([sys.executable, "direct_api_test.py"], capture_output=True, text=True)
    print(result.stdout)
    
    # Run the basic integration test
    print("\n2. Testing CodeExecutionService integration...")
    result = subprocess.run([sys.executable, "test_integration.py"], capture_output=True, text=True)
    print(result.stdout)

def main():
    parser = argparse.ArgumentParser(description="Setup and test code execution integration")
    parser.add_argument("--start-service", action="store_true", 
                        help="Start the execute-test service")
    parser.add_argument("--execute-test-path", default="../execute-test/picobytes-execute-test",
                        help="Path to the execute-test repository")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("CODE EXECUTION INTEGRATION SETUP")
    print("=" * 60)
    
    # Check if the execute-test service is running
    is_running = check_execute_test_service("http://localhost:5000")
    
    if not is_running:
        print("❌ execute-test service is not running")
        
        if args.start_service:
            is_running = run_execute_test_service(args.execute_test_path)
        else:
            print(f"\nPlease start the service with:")
            print(f"cd {args.execute_test_path} && python3 api/server_api.py")
            return
    else:
        print("✅ execute-test service is running")
    
    if is_running:
        # Check the server response format
        check_server_response("http://localhost:5000")
        
        # Run integration tests
        run_integration_tests()
        
        print("\n" + "=" * 60)
        print("SETUP COMPLETE")
        print("=" * 60)
        print("\nDocumentation is available at docs/execute-test-integration.md")

if __name__ == "__main__":
    main() 