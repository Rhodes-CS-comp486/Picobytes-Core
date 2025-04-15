#!/bin/bash

# This script runs the necessary database updates for the coding question submission system

cd "$(dirname "$0")"

echo "Updating database schema for coding question submission system..."
python3 Picobytes/backend/db_update_for_code_execution.py

echo "Done!"
echo "The database schema has been updated to support the coding question submission system."
echo "You can now restart the application to apply the changes." 