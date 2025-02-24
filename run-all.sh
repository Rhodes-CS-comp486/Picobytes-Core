#!/bin/bash

# Navigate to the backend directory and start the backend server
cd Picobytes/backend
echo "Starting backend server..."
python app.py &

# Navigate to the frontend directory and start the frontend server
cd ../frontend
echo "Starting frontend server..."
npm run dev &

# Wait for both background jobs to finish
wait
