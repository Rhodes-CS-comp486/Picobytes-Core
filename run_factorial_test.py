#!/usr/bin/env python3

import sys
import os
from test_factorial_validation import test_factorial_validation

if __name__ == "__main__":
    print("Running factorial validation test to verify incomplete implementations are detected...")
    result = test_factorial_validation()
    
    if result:
        print("\n✅ SUCCESS: The validation test passed!")
        print("The system correctly identifies incomplete implementations.")
        sys.exit(0)
    else:
        print("\n❌ FAILURE: The validation test failed!")
        print("There may still be issues with detecting incomplete implementations.")
        sys.exit(1) 