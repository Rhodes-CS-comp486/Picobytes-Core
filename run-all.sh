#!/bin/bash

# Store the PIDs of our processes
backend_pid=""
frontend_pid=""
proxy_pid=""

# Function to kill processes on script exit
cleanup() {
  echo "Shutting down servers..."
  [ ! -z "$backend_pid" ] && kill $backend_pid
  [ ! -z "$frontend_pid" ] && kill $frontend_pid
  [ ! -z "$proxy_pid" ] && kill $proxy_pid
  exit
}

# Set trap to ensure cleanup happens when script is terminated
trap cleanup INT TERM EXIT

# Navigate to the backend directory and start the backend server
cd Picobytes/backend
echo "Starting backend server..."
python app.py &
backend_pid=$!
echo "Backend PID: $backend_pid"

# Navigate to the frontend directory and start the frontend server
cd ../frontend
echo "Starting frontend server..."
npm run dev &
frontend_pid=$!
echo "Frontend PID: $frontend_pid"

# Navigate back to the root directory and start the proxy server
cd ../..
echo "Starting proxy server..."
python simple_proxy.py &
proxy_pid=$!
echo "Proxy PID: $proxy_pid"

echo "Servers running. Press Ctrl+C to stop all servers."

# Wait for all background jobs to finish
wait
