#!/bin/bash

# This script runs the necessary database updates for the code blocks execution

cd "$(dirname "$0")"

echo "Updating database schema for code blocks execution..."
python3 Picobytes/backend/db_update_for_code_execution.py

echo "Done!"
echo "The database schema has been updated to support code blocks execution."
echo "You can now restart the application to apply the changes." 