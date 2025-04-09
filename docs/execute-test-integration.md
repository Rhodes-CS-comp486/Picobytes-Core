# Execute-Test Integration Guide

This document explains how to use and test the integration between Picobytes-Core and the execute-test service for code execution functionality.

## Overview

The integration allows Picobytes-Core to submit C code for compilation, execution, and testing using the execute-test service. This is accomplished through the `CodeExecutionService` without modifying the execute-test codebase.

## Prerequisites

1. The execute-test service must be running and accessible
2. The Picobytes-Core backend must be configured to point to the execute-test service

## Setup

1. **Start the execute-test service**:

```bash
cd /path/to/execute-test/picobytes-execute-test
python3 api/server_api.py
```

2. **Configure the Picobytes-Core backend**:

Make sure the `CODE_EXECUTION_API_URL` in `Picobytes/backend/config.py` points to the correct URL (default is "http://localhost:5000").

## Important Implementation Details

### Main Function Limitation

The execute-test service adds its own `main()` function during the compilation process. Due to this limitation, **you must not include a main function in your code submissions**. 

Instead, follow this pattern:

1. Submit your code as functions without a `main()` function
2. Provide tests that call your functions (the test code will be inserted into the main function)

### Example

**Incorrect** (will cause compilation errors):
```c
// Code submission with main function - WILL FAIL
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

**Correct** approach:
```c
// Code submission - just the function
#include <stdio.h>

void sayHello() {
    printf("Hello, World!\n");
}
```

```c
// Test code - will be placed in the main function
sayHello();
return 0;
```

## Running Integration Tests

To verify the integration is working correctly:

```bash
# Run the basic integration test
cd /path/to/Picobytes-Core
python3 test_integration.py

# Run the comprehensive integration test suite
python3 integration_test_suite.py
```

## Troubleshooting

### Common Issues

1. **Compilation errors about "redefinition of 'main'"**:
   - Your code already contains a `main()` function
   - Solution: Remove the `main()` function from your code and move test logic to the test section

2. **Connection errors**:
   - The execute-test service is not running or is on a different port
   - Solution: Check the service is running and update `CODE_EXECUTION_API_URL` in config.py

3. **Test failures**:
   - Check the output for specific assertion failures
   - Verify the tests are properly structured

## Using in Production

When using this integration in production:

1. Ensure the execute-test service is properly secured
2. Consider containerizing both services for isolation
3. Set appropriate timeouts for code execution
4. Monitor for resource-intensive code submissions 