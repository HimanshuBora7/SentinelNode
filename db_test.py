import os
import psycopg2
from dotenv import load_dotenv

# Load variables from the .env file into the system's environment
load_dotenv()

def verify_database_connection():
    try:
        # Establish connection using environment variables
        connection = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        
        cursor = connection.cursor()
        print("Python successfully connected to PostgreSQL!")

        # Execute a test query to read our seeded target account
        cursor.execute("SELECT handle, platform, priority FROM accounts;")
        monitored_accounts = cursor.fetchall()

        print("\n--- Current Monitored Accounts ---")
        for account in monitored_accounts:
            print(f"Handle: @{account[0]} | Platform: {account[1]} | Priority: {account[2]}")
        print("----------------------------------")

        # Clean up resources
        cursor.close()
        connection.close()

    except Exception as error:
        print(f" Database connection failed! Error: {error}")

if __name__ == "__main__":
    verify_database_connection()