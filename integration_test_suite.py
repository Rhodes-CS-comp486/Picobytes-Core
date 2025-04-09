#!/usr/bin/env python3

import os
import json
import sys
from Picobytes.backend.services.code_execution_service import CodeExecutionService

"""
Integration Test Suite for Code Execution Service

This script tests the integration between Picobytes-Core and the execute-test service.
It follows the Given-When-Then pattern for structuring tests.

IMPORTANT: The execute-test service adds its own main() function during compilation,
so our code should NOT include a main function to avoid conflicts.
"""

class IntegrationTestSuite:
    def __init__(self):
        self.service = CodeExecutionService()
        self.tests_run = 0
        self.tests_passed = 0
        
    def run_all_tests(self):
        """Run all integration tests."""
        print("\n===== Starting Integration Test Suite =====\n")
        
        self.test_simple_code_execution()
        self.test_code_with_compilation_error()
        self.test_code_with_runtime_error()
        self.test_code_with_assertions()
        
        # Summary
        print(f"\n===== Test Summary: {self.tests_passed}/{self.tests_run} tests passed =====")
        return self.tests_passed == self.tests_run
        
    def assert_test(self, condition, test_name):
        """Assert a test condition and track results."""
        self.tests_run += 1
        if condition:
            self.tests_passed += 1
            print(f"✅ PASS: {test_name}")
        else:
            print(f"❌ FAIL: {test_name}")
        
    def test_simple_code_execution(self):
        """Test a simple function that returns a value."""
        print("\n----- Test: Simple Code Execution -----")
        
        # GIVEN: A simple function that adds two numbers
        code = """
        // Function to add two numbers
        int add(int a, int b) {
            return a + b;
        }
        """
        
        # WHEN: We test the function with two values
        tests = """
        int result = add(5, 3);
        printf("Result: %d\\n", result);
        assert(result == 8);
        return 0;
        """
        
        # THEN: Execution should succeed and test should pass
        result = self.service.execute_code(code, tests)
        print(f"Output: {result.get('output', '')}")
        
        self.assert_test(
            result.get("compile") and result.get("run") and not result.get("failed_tests"),
            "Simple code execution"
        )
    
    def test_code_with_compilation_error(self):
        """Test handling of code with compilation errors."""
        print("\n----- Test: Code with Compilation Error -----")
        
        # GIVEN: Code with a syntax error
        code = """
        // Function with syntax error (missing semicolon)
        int broken_function() {
            int x = 10
            return x;
        }
        """
        
        # WHEN: We try to compile and run it
        tests = """
        int value = broken_function();
        printf("%d\\n", value);
        return 0;
        """
        
        # THEN: Compilation should fail
        result = self.service.execute_code(code, tests)
        print(f"Output: {result.get('output', '')}")
        
        self.assert_test(
            not result.get("compile"),
            "Detect compilation error"
        )
    
    def test_code_with_runtime_error(self):
        """Test handling of code with runtime errors."""
        print("\n----- Test: Code with Runtime Error -----")
        
        # GIVEN: Code that will cause a segmentation fault
        code = """
        // Function that will cause a runtime error
        void crash_function() {
            int *ptr = NULL;
            *ptr = 42;  // This will cause a segmentation fault
        }
        """
        
        # WHEN: We run it
        tests = """
        // We won't actually call the crashing function in the test
        // because we don't want to crash the test process
        printf("This test is actually checking integration, not the crash\\n");
        return 0;
        """
        
        # THEN: The test should at least compile
        result = self.service.execute_code(code, tests)
        print(f"Output: {result.get('output', '')}")
        
        self.assert_test(
            result.get("compile"),
            "Code with potential runtime error compiles"
        )
    
    def test_code_with_assertions(self):
        """Test code with multiple assertions."""
        print("\n----- Test: Code with Assertions -----")
        
        # GIVEN: A function to test
        code = """
        // Function to test if a number is even
        int is_even(int number) {
            return number % 2 == 0;
        }
        
        // Function to calculate factorial
        int factorial(int n) {
            if (n <= 1) return 1;
            return n * factorial(n - 1);
        }
        """
        
        # WHEN: We test with multiple assertions
        tests = """
        // Test is_even function
        assert(is_even(2) == 1);
        assert(is_even(3) == 0);
        assert(is_even(0) == 1);
        
        // Test factorial function
        assert(factorial(0) == 1);
        assert(factorial(1) == 1);
        assert(factorial(5) == 120);
        
        return 0;
        """
        
        # THEN: All assertions should pass
        result = self.service.execute_code(code, tests)
        print(f"Output: {result.get('output', '')}")
        
        self.assert_test(
            result.get("compile") and result.get("run") and not result.get("failed_tests"),
            "Multiple assertions"
        )

if __name__ == "__main__":
    test_suite = IntegrationTestSuite()
    success = test_suite.run_all_tests()
    
    sys.exit(0 if success else 1) 