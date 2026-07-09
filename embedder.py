import os
import sys
import json
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()

# Verify OpenRouter Auth presence
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    print(" Error: OPENROUTER_API_KEY missing from environment configurations.")
    sys.exit(1)

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )

def fetch_vector_from_openrouter(text_to_embed):
    """
    Hits OpenRouter's unified embedding endpoint directly via REST.
    """
    url = "https://openrouter.ai/api/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openai/text-embedding-3-small",
        "input": text_to_embed
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=15.0)
    
    if response.status_code != 200:
        raise RuntimeError(f"OpenRouter API Error [{response.status_code}]: {response.text}")
        
    response_data = response.json()
    # Extract the float coordinate array out of the response envelope
    return response_data["data"][0]["embedding"]

def populate_missing_embeddings():
    print("Starting Vector Embeddings Sync Pipeline...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Locate items that have been processed into the matrix but lack vector coordinates
    cur.execute("""
        SELECT id, summary 
        FROM processed_intelligence 
        WHERE summary IS NOT NULL AND summary_embedding IS NULL;
    """)
    unindexed_rows = cur.fetchall()
    
    if not unindexed_rows:
        print("ℹAll records completely indexed. No new vector tasks found.")
        cur.close()
        conn.close()
        return

    print(f"Found {len(unindexed_rows)} rows requiring vector mapping.")

    for row_id, summary_text in unindexed_rows:
        print(f"Computing coordinates for Row ID [{row_id}]...")
        try:
            # 1. Fetch the 1536 float coordinates array
            vector_array = fetch_vector_from_openrouter(summary_text)
            
            # 2. Stringifying a Python list format matches PostgreSQL's vector syntax perfectly
            cur.execute("""
                UPDATE processed_intelligence 
                SET summary_embedding = %s 
                WHERE id = %s;
            """, (str(vector_array), row_id))
            
            conn.commit()
            print(f"Row [{row_id}] vector index verified.")
            
        except Exception as err:
            conn.rollback()
            print(f"Stalled on Row ID {row_id}: {err}")

    cur.close()
    conn.close()
    print("🏁 Embedding loop sweep finished.")

if __name__ == "__main__":
    populate_missing_embeddings()