import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

def list_accounts():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT handle, priority FROM accounts WHERE platform = 'X' ORDER BY priority ASC, handle ASC;")
    accounts = cur.fetchall()
    print("Currently monitored X accounts:")
    print(f"{'Handle':<20} | Rank")
    print("-" * 30)
    for acc in accounts:
        handle = acc[0]
        rank = acc[1] if acc[1] is not None else "Unranked"
        print(f"{handle:<20} | {rank}")
    cur.close()
    conn.close()

def add_account(handle):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Assuming priority is an integer. Defaulting to 1.
        cur.execute("INSERT INTO accounts (handle, platform, priority) VALUES (%s, 'X', 1) ON CONFLICT DO NOTHING;", (handle,))
        conn.commit()
        print(f"✅ Added {handle} to database.")
    except Exception as e:
        print(f"Error adding account: {e}")
    finally:
        cur.close()
        conn.close()

def remove_account(handle):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Delete dependent records from processed_intelligence
        cur.execute("""
            DELETE FROM processed_intelligence 
            WHERE post_id IN (
                SELECT post_id FROM raw_posts WHERE account_handle = %s
            );
        """, (handle,))
        
        # 2. Delete raw_posts for the account
        cur.execute("DELETE FROM raw_posts WHERE account_handle = %s;", (handle,))
        
        # 3. Delete the account itself
        cur.execute("DELETE FROM accounts WHERE handle = %s AND platform = 'X';", (handle,))
        
        conn.commit()
        print(f"✅ Removed {handle} and all associated data from database.")
    except Exception as e:
        print(f"Error removing account: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def update_priority(handle, rank):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE accounts SET priority = %s WHERE handle = %s AND platform = 'X';", (rank, handle))
        if cur.rowcount > 0:
            conn.commit()
            print(f"✅ Updated {handle} to rank {rank}.")
        else:
            print(f"⚠️ Account {handle} not found.")
    except Exception as e:
        print(f"Error updating rank: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python manage_accounts.py [list | add <handle> | remove <handle> | rank <handle> <priority>]")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "list":
        list_accounts()
    elif command == "add" and len(sys.argv) == 3:
        add_account(sys.argv[2])
    elif command == "remove" and len(sys.argv) == 3:
        remove_account(sys.argv[2])
    elif command == "rank" and len(sys.argv) == 4:
        update_priority(sys.argv[2], int(sys.argv[3]))
    else:
        print("Invalid command. Use list, add <handle>, remove <handle>, or rank <handle> <priority>.")
