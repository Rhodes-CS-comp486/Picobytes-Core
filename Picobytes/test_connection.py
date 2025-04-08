import psycopg
from psycopg.rows import dict_row
from Picobytes.backend.db_info import *

# Connect to an existing database
conn = psycopg.connect(f"host=dbclass.rhodescs.org dbname=pico user={'pico'} password={'pico'}")

# Print the connection status
print(f"Database: {conn.info.dbname}")
print(f"User: {conn.info.user}")
print(f"Host: {conn.info.host}")
print(f"Port: {conn.info.port}")
print(f"Backend PID: {conn.info.backend_pid}")
print(f"Server version: {conn.info.server_version}")
print(f"Default client encoding: {conn.info.encoding}")