#!/bin/bash

# Stop any existing container with the same name
echo "Stopping any existing execute-test container..."
docker stop execute-test-container 2>/dev/null || true
docker rm execute-test-container 2>/dev/null || true

# Navigate to the execute-test directory
cd /Users/elihebert/Desktop/comp486/execute-test/picobytes-execute-test

# Pull the Docker image
echo "Pulling Docker image..."
docker pull dewitt483/picobytes:v4

# Run the container, mapping port 5001 to 5000
# This makes the API accessible at http://localhost:5001
echo "Starting execute-test container..."
docker run --name execute-test-container -d -p 5001:5000 dewitt483/picobytes:v4

echo "Container started. Use 'docker logs execute-test-container' to view logs." 