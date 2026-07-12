import time
import random
import psycopg2
import os
from clusterer import cluster_recent_posts
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pipeline import run_ingestion_pipeline
from classifier import pipeline_sweep_batch
from embedder import populate_missing_embeddings

load_dotenv()

# Dictionary to keep track of when we last scraped each account
last_scraped = {}

def get_ist_hour():
    # IST is UTC+5:30
    ist_time = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    return ist_time.hour

def fetch_monitored_accounts():
    """Queries the database to get the active target list and their priority."""
    connection = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    cursor = connection.cursor()
    try:
        # Fetch accounts to monitor along with their priority
        cursor.execute("SELECT handle, priority FROM accounts WHERE platform = 'X';")
        accounts = [{"handle": row[0], "priority": str(row[1]).lower().strip() if row[1] else "1"} for row in cursor.fetchall()]
        return accounts
    except Exception as e:
        print(f" Failed to fetch accounts from database: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

def get_interval_for_priority(priority_str):
    """Maps a string priority to a target polling interval in seconds."""
    # Rank 1, High, Tier 1 -> ~15 mins
    if priority_str in ["1", "high", "tier 1", "tier1", "top"]:
        return 15 * 60
    # Rank 2 -> ~40 mins
    elif priority_str == "2":
        return 40 * 60
    # Rank 3 -> ~60 mins
    elif priority_str == "3":
        return 60 * 60
    # Default to 45 mins if unknown
    else:
        return 45 * 60

def start_orchestrator():
    print(" Starting Priority-Based Master Pipeline Scheduler...")
    
    while True:
        current_hour = get_ist_hour()
        is_night = 1 <= current_hour < 7
        
        # 1. Fetch latest targets from DB on every tick
        targets = fetch_monitored_accounts()
        
        if not targets:
            print("ℹ No accounts found in database. Sleeping for 60 seconds...")
            time.sleep(60)
            continue
            
        current_time = time.time()
        due_accounts = []
        
        # 2. Check which accounts are due based on their last scrape time
        for target in targets:
            handle = target["handle"]
            priority = target["priority"]
            
            # Base interval from priority
            base_interval = get_interval_for_priority(priority)
            
            # If it's night time in IST, double the interval to minimize detection
            if is_night:
                base_interval *= 2
                
            # Random jitter +/- 10% to look human
            jitter = random.randint(int(-0.1 * base_interval), int(0.1 * base_interval))
            target_interval = base_interval + jitter
            
            last_time = last_scraped.get(handle, 0)
            time_since_last = current_time - last_time
            
            if time_since_last >= target_interval:
                due_accounts.append(handle)
        
        if not due_accounts:
            print(f"💤 No accounts due for polling right now. Master Loop sleeping for 3 minutes...")
            time.sleep(180)
            continue
            
        print(f" Found {len(due_accounts)} accounts due for polling out of {len(targets)} total. Beginning batched extraction cycle.")
        
        # 3. Execute the pipeline for ONLY the due targets
        run_ingestion_pipeline(due_accounts)
            
        # 4. Update the last scraped time for everything we just processed
        for handle in due_accounts:
            last_scraped[handle] = time.time()
            
        print("\n Scraping complete. Running AI Classification on all pending posts...")
        for _ in range(5):
            pipeline_sweep_batch()
            
        print("\n Classification complete. Generating Vector Embeddings for new intelligence...")
        populate_missing_embeddings()
        print("\n Clustering duplicate stories...")
        cluster_recent_posts()
        print("\n Full batched cycle complete. Master loop sleeping for 3 minutes before checking queue again...")
        time.sleep(180)

if __name__ == "__main__":
    start_orchestrator()
   