#!/bin/bash

# Stop any existing container with the same name
echo "Stopping any existing execute-test container..."
docker stop execute-test-container 2>/dev/null || true
docker rm execute-test-container 2>/dev/null || true

# Navigate to the execute-test directory
cd /Users/elihebert/Desktop/comp486/execute-test/picobytes-execute-test

# Ensure the Dockerfile has the right port exposed (5000)
if grep -q "EXPOSE 80" Dockerfile; then
  echo "Updating port in Dockerfile from 80 to 5000..."
  sed -i.bak 's/EXPOSE 80/EXPOSE 5000/g' Dockerfile
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t execute-test-image .

# Run the container, mapping port 5001 to 5000
# This makes the API accessible at http://localhost:5001
echo "Starting execute-test container..."
docker run --name execute-test-container -d -p 5001:5000 execute-test-image

echo "Container started. Use 'docker logs execute-test-container' to view logs." 