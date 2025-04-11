# Docker Integration for Execute-Test Service

This document explains how the Picobytes-Core application integrates with the execute-test service using Docker.

## Overview

The execute-test service is run in a Docker container, which provides the following benefits:

1. Isolation: The service runs in its own container, separate from the main application
2. Consistency: The Docker environment ensures consistent behavior across different setups
3. Security: The execution environment is containerized, reducing security risks

## Architecture

- **Picobytes-Core Backend**: Runs on port 5000
- **Execute-Test Service**: Runs in Docker container on port 5001
- **Picobytes Frontend**: Runs on port 5173

The backend communicates with the execute-test service via HTTP requests to `http://localhost:5001`.

## Setup and Running

### Automatic Setup

Run the integrated startup script to start all services:

```bash
./run-all.sh
```

This script:
1. Starts the execute-test Docker container
2. Starts the Picobytes-Core backend
3. Starts the Picobytes-Core frontend
4. Sets up proper cleanup on shutdown

### Manual Setup

If you need to run components individually:

1. Start the execute-test Docker container:
   ```bash
   ./docker-start.sh
   ```

2. Start the backend server:
   ```bash
   cd Picobytes/backend
   python app.py
   ```

3. Start the frontend server:
   ```bash
   cd Picobytes/frontend
   npm run dev
   ```

## Troubleshooting

### Docker Container Issues

- Check container status: `docker ps -a`
- View container logs: `docker logs execute-test-container`
- Restart container: `docker restart execute-test-container`
- Rebuild container: `./docker-start.sh`

### Connection Issues

- Verify the backend `config.py` has `CODE_EXECUTION_API_URL = "http://localhost:5001"`
- Check Docker container is running and listening on port 5001
- Test direct API access: `curl -X GET http://localhost:5001/`

## Development Notes

When developing, remember:

1. Changes to the execute-test service require rebuilding the Docker container
2. The `docker-start.sh` script handles stopping, rebuilding, and starting the container
3. The Docker container exposes port 80 internally but is mapped to port 5001 externally 