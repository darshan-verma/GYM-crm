import os
import psycopg2
from psycopg2 import sql

# Get the database URL from environment variable
database_url = "postgresql://darshanverma:root@localhost:5432/postgres"

if not database_url:
    print("DATABASE_URL environment variable is not set.")
    exit(1)

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(database_url)

    # Create a cursor object
    cur = conn.cursor()

    # Execute a sample SQL command
    cur.execute("SELECT version();")

    # Fetch the result
    result = cur.fetchone()

    # Print the result
    print("PostgreSQL version:")
    print(result[0])

    # Close the cursor and connection
    cur.close()
    conn.close()

except psycopg2.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"Error: {e}")