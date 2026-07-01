import time
import random
import psycopg2
import os
from dotenv import load_dotenv
# Import the engine function we just built and tested
from pipeline import run_ingestion_pipeline

load_dotenv()

def fetch_monitored_accounts():
    """Queries the database to get the active target list."""
    connection = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    cursor = connection.cursor()
    try:
        # Fetch accounts to monitor
        cursor.execute("SELECT handle FROM accounts WHERE platform = 'X';")
        accounts = [row[0] for row in cursor.fetchall()]
        return accounts
    except Exception as e:
        print(f"❌ Failed to fetch accounts from database: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

def start_orchestrator():
    print("⏳ Starting Master Pipeline Scheduler...")
    
    while True:
        # Dynamic Lookup: Get the latest targets from the DB on every cycle
        targets = fetch_monitored_accounts()
        
        if not targets:
            print("ℹ️ No accounts found in database. Sleeping for 60 seconds...")
            time.sleep(60)
            continue
            
        print(f"📋 Found {len(targets)} monitoring targets. Beginning extraction cycle.")
        
        for handle in targets:
            # 1. Execute the pipeline for the individual account
            run_ingestion_pipeline(handle)
            
            # 2. Inject Micro-Jitter between accounts to look human
            # Sleeps anywhere from 15 to 45 seconds between individual profiles
            account_jitter = random.randint(15, 45)
            print(f"💤 Account cycle complete. Jittering for {account_jitter} seconds before next target...")
            time.sleep(account_jitter)
            
        # 3. Macro-Jitter between full cycles
        # Base cycle time is ~20 minutes (1200 seconds) + a random swing of +/- 5 minutes
        base_cycle_time = 1200
        cycle_variance = random.randint(-300, 300)
        total_cycle_sleep = max(600, base_cycle_time + cycle_variance) # Guarantee minimum 10 min sleep
        
        print(f"🏁 Full tracking cycle complete. Sleeping for {total_cycle_sleep // 60} minutes before polling again...")
        time.sleep(total_cycle_sleep)

if __name__ == "__main__":
    start_orchestrator()