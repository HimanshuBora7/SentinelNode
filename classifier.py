import os
import sys
import json
import psycopg2
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize the official Google GenAI Client
# Expects GEMINI_API_KEY to be set in your .env file
try:
    client = genai.Client()
    
except Exception as e:
    print(f"❌ Failed to initialize Gemini Client: {e}")
    sys.exit(1)
# # Check available models
# print("🔍 Checking available models...")
# for m in client.models.list():
#     if "generateContent" in m.supported_actions:
#         print(f"✅ Supported model: {m.name}")
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"), user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"), host=os.getenv("DB_HOST"), port=os.getenv("DB_PORT")
    )

def process_unclassified_posts():
    print("🤖 AI Classification Worker booting up...")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Fetch a batch of unprocessed text fields
    cur.execute("""
        SELECT post_id, account_handle, text, timestamp, post_url 
        FROM raw_posts 
        WHERE is_processed = FALSE 
        LIMIT 10;
    """)
    unprocessed_rows = cur.fetchall()
    
    if not unprocessed_rows:
        print("ℹ️ Queue empty. No unclassified posts found.")
        cur.close()
        conn.close()
        return

    print(f"📋 Found {len(unprocessed_rows)} fresh records in the processing queue.")

    # System Instruction guiding the analytical engine
    system_prompt = (
        "You are a military intelligence watch officer. Analyze the given text payload "
        "and determine if it contains high-signal information regarding defense, military aviation, "
        "national security, regional conflicts, strategic infrastructure, or geopolitical defense procurement. "
        "Classify it strictly into one of two categories:\n"
        "1. DEFENSE: Directly related to military, strategic security, arms, geopolitical standoffs, or aerospace intelligence.\n"
        "2. TRIVIAL: Domestic politics, civic news, entertainment, general sports, or casual commentary."
    )

    for row in unprocessed_rows:
        post_id, handle, text_content, timestamp, post_url = row
        print(f"\n🧠 Evaluating item [{post_id}] from @{handle}...")
        
        try:
            # Execute structured JSON generation using Gemini 1.5 Flash
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=f"Text to evaluate:\n\"\"\"\n{text_content}\n\"\"\"",
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    # Force the model to return a structured JSON mapping matching our application layer
                    response_mime_type="application/json",
                    response_schema=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "category": types.Schema(type=types.Type.STRING, enum=["DEFENSE", "TRIVIAL"]),
                            "confidence_score": types.Schema(type=types.Type.NUMBER),
                            "justification": types.Schema(type=types.Type.STRING)
                        },
                        required=["category", "confidence_score", "justification"]
                    ),
                    temperature=0.1 # Low temperature for consistent, strict analytical classification
                ),
            )
            
            # Parse the model's structured response string
            analysis = json.loads(response.text)
            category = analysis.get("category")
            confidence = analysis.get("confidence_score")
            justification = analysis.get("justification")
            
            print(f"📊 Result: Category={category} | Confidence={confidence}")
            print(f"📝 Reason: {justification}")
            
            # Transaction branch: If it's a valid intelligence lead, route it or drop it based on classification
            if category == "DEFENSE":
                print(f"🎯 HIGH SIGNAL DETECTED. Indexing post into intelligence matrix...")
                # Here you can map an INSERT statement to your frontend-facing 'classified_leads' table.
                # For this test run, we will focus on updating the state pipeline.

            # Update state flag so the queue knows this record is handled
            cur.execute("UPDATE raw_posts SET is_processed = TRUE WHERE post_id = %s;", (post_id,))
            conn.commit()
            
        except Exception as eval_err:
            conn.rollback()
            print(f"⚠️ Failed to accurately process item {post_id}: {eval_err}")
            
    cur.close()
    conn.close()
    print("\n🏁 Queue processing sweep complete.")

if __name__ == "__main__":
    process_unclassified_posts()