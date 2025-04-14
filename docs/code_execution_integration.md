# Code Execution Integration Guide

This guide explains how to integrate the Picobytes application with the execute-test service for code execution.

## Overview

The Execute & Test service is a Docker-based API that allows for safe execution and testing of C code. This integration enables Picobytes to:

1. Execute user-submitted code in a sandboxed environment
2. Run tests against the code to verify correctness
3. Capture compilation errors and execution output

## Prerequisites

- Docker Desktop installed and running
- Access to both Picobytes-Core and picobytes-execute-test repositories

## Setup Steps

### 1. Build and Run the Execute-Test Container

Navigate to the picobytes-execute-test repository and run:

```bash
# Build the Docker image
docker build -t execute-test-api .

# Run the container on port 5000
docker run -p 5000:5000 execute-test-api
```

### 2. Configure Picobytes Integration

From the Picobytes-Core repository, run the setup script:

```bash
# Basic setup with default URL (http://localhost:5000)
python setup_code_execution_integration.py

# Specify a custom API URL
python setup_code_execution_integration.py --api-url "http://custom-host:5000"

# Update the database schema
python setup_code_execution_integration.py --update-db
```

### 3. Testing the Integration

You can test the integration using the new test endpoint:

```bash
curl -X POST http://your-picobytes-server/api/test-code-execution \
  -H "Content-Type: application/json" \
  -d '{"code": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello World\\n\");\n    return 0;\n}", "tests": ""}'
```

## Database Schema Changes

The integration adds the following changes to the database:

1. `code_blocks` table:
   - New `tests` column for storing test assertions

2. `user_code_blocks` table:
   - New `output` column for storing execution output
   - New `compile_status` column to track compilation success
   - New `run_status` column to track execution success

## Technical Details

### API Endpoints

The execute-test service exposes the following endpoints:

- `POST /submit`: Submit code and optional tests
- `POST /execute_code`: Execute code without tests
- `POST /encoded`: Submit base64-encoded code and tests

### Integration Architecture

1. User submits code through Picobytes UI
2. Picobytes backend forwards the code to the execute-test API
3. The execute-test service compiles and runs the code in a sandboxed environment
4. Results are returned to Picobytes for display and grading

### Security Considerations

- All code execution happens in a Docker container for isolation
- Execution timeouts prevent infinite loops
- Resource limits prevent excessive CPU or memory usage

## Troubleshooting

- Ensure Docker is running
- Check that the execute-test container is accessible on the configured port
- Verify network connectivity between Picobytes and the execute-test service
- Check logs for both services to identify any issues 