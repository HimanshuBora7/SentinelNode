import os
import sys
import json
import psycopg2
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# OpenRouter Configuration Setup
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print(" Missing OPENROUTER_API_KEY in environment.")
    sys.exit(1)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Configuration settings matching your blueprint
PRIMARY_MODEL = "deepseek/deepseek-chat" # Toggle to "google/gemini-2.5-flash" or similar via config change
SCHEMA_VERSION = 1

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"), user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"), host=os.getenv("DB_HOST"), port=os.getenv("DB_PORT")
    )

def clean_json_string(raw_string):
    """Defensively strips markdown code fences or rogue lines before parsing"""
    cleaned = raw_string.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def pipeline_sweep_batch():
    print(f"OpenRouter Intelligence Worker operating via model: {PRIMARY_MODEL}")
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 1. Pull un-extracted target posts from the state machine queue
    cur.execute("""
        SELECT post_id, account_handle, text 
        FROM raw_posts 
        WHERE status = 'PENDING' 
        LIMIT 10;
    """)
    batch = cur.fetchall()
    
    if not batch:
        print("ℹ Queue clear. No pending records detected.")
        cur.close()
        conn.close()
        return

    print(f"Locked {len(batch)} items for batch processing loop.")

    system_prompt = (
        "You are an expert military intelligence watch officer. Parse the text payload and return a valid JSON object matching the schema criteria exactly. "
        "Analyze the content strictly through a defense lens and map it to these rigid structural definitions:\n\n"
        "Categories:\n"
        "- Aerospace: Fighter jets, military drones, military transport aircraft, missile flight tests, air defense networks.\n"
        "- Naval: Submarines, aircraft carriers, naval exercises, maritime security operations.\n"
        "- Land Systems: Tanks, armored vehicles, artillery, infantry developments, tactical border infrastructure.\n"
        "- Geopolitics: Strategic global defense treaties, international sanctions, diplomatic defense summits.\n"
        "- Trivial: Domestic local political disputes, civilian events, entertainment, sports, or historical updates completely lacking present tactical threat or urgency.\n\n"
        "Importance Tiers:\n"
        "- HIGH: Active/imminent combat deployments, urgent multi-billion dollar emergency combat aircraft/fleet procurement orders, strategic nuclear weapon trials.\n"
        "- MEDIUM: Scheduled multilateral military exercises, standard iterative technological upgrades to existing fleets, routine administrative command handovers.\n"
        "- LOW: Historical media throwbacks, ceremonial parades, non-urgent military retirement announcements, veteran acknowledgements.\n\n"
                "Content Types:\n"
        "- NEWS: Factual reporting of events, military deployments, or defense procurements. Contains verifiable claims.\n"
        "- OPINION: Personal commentary, speculation, political spin, or subjective language ('I think', 'should have', 'disappointing').\n"
        "- ANALYSIS: Objective, factual breakdown of a military event with strategic reasoning, but no breaking factual claims.\n\n"

        "Required Output JSON Structure:\n"
        "{\n"
        '  "is_defense_related": true|false,\n'
        '  "confidence": 0.0 to 1.0,\n'
        '  "category": "Aerospace"|"Naval"|"Land Systems"|"Geopolitics"|"Trivial",\n'
        '  "content_type": "NEWS"|"OPINION"|"ANALYSIS",\n'
        '  "importance": "HIGH"|"MEDIUM"|"LOW",\n'
        '  "headline": "Short 5-10 word punchy headline for the intelligence brief.",\n'
        '  "summary": "1-2 sentence concise, factual analytical summary expanding on the headline.",\n'
        '  "keywords": ["keyword1", "keyword2"],\n'
        '  "entities": ["Organization", "Location", "Weapon System"]\n'
        "}"
    )

    few_shot_examples = (
        "\n\nExample 1: 'Flashback to 1965: A rare look at the tactical configurations of the Indian Army division positions near the border.'\n"
        'Output: {"is_defense_related": true, "confidence": 1.0, "category": "Land Systems", "content_type": "ANALYSIS", "importance": "LOW", "headline": "1965 Border Division Positions Revisited", "summary": "Historical media overview revisiting tactical configurations of Indian Army divisions deployed near the border during the 1965 conflict.", "keywords": ["history", "1965", "border"], "entities": ["Indian Army"]}\n'
        "\nExample 2: 'The defense ministry starts routine trials for upgrading tracking software variants on older naval frigates.'\n"
        'Output: {"is_defense_related": true, "confidence": 0.95, "category": "Naval", "content_type": "NEWS", "importance": "MEDIUM", "headline": "Navy Frigate Tracking Software Upgrade Trials Begin", "summary": "Defense ministry initiates routine trials to upgrade tracking software systems on aging naval frigates in the active fleet.", "keywords": ["upgrade", "frigate", "trials"], "entities": ["Ministry of Defense"]}\n'
        "\nExample 3: 'This new submarine deal is an absolute disaster. The government should have invested those funds into drone swarms instead.'\n"
        'Output: {"is_defense_related": true, "confidence": 0.95, "category": "Naval", "content_type": "OPINION", "importance": "LOW", "headline": "Criticism of Recent Submarine Procurement Deal", "summary": "Commentator expresses strong subjective disapproval regarding the recent submarine procurement deal, advocating for investment in drone swarm technology instead.", "keywords": ["submarine", "drones", "procurement"], "entities": []}'
    )

    for post_id, handle, content in batch:
        print(f"\nRequesting extraction parameters for item [{post_id}]...")
        
        # Mark row as processing immediately to lock it
        cur.execute("UPDATE raw_posts SET status = 'PROCESSING' WHERE post_id = %s;", (post_id,))
        conn.commit()
        
        try:
            # Call OpenRouter with a strict client side timeout to stop freezing dead drops
            response = client.chat.completions.create(
                model=PRIMARY_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt + few_shot_examples},
                    {"role": "user", "content": f"Source: @{handle}\nContent: {content}"}
                ],
                timeout=20.0 # Strict 20 second absolute server cutoff line
            )
            
            raw_text = response.choices[0].message.content
            cleaned_json = clean_json_string(raw_text)
            parsed_data = json.loads(cleaned_json)
            
            # Validation Step: Ensure vital schema attributes match up
            is_defense = parsed_data.get("is_defense_related", False)
            confidence = parsed_data.get("confidence", 0.0)
            
            # Set state based on intelligence matrix bounds
            final_state = "DONE"
            if confidence < 0.85:
                final_state = "NEEDS_REVIEW"
                
            if is_defense:
                print(f"Verified Defense Lead Detected. Populating intelligence matrix row.")
                cur.execute("""
                    INSERT INTO processed_intelligence (post_id, account_handle, category, content_type, importance, confidence_score, headline, summary, keywords, entities)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (post_id) DO NOTHING;
                """, (
                    post_id, handle, parsed_data.get("category"), parsed_data.get("content_type", "NEWS"), parsed_data.get("importance", "LOW"),
                    confidence, parsed_data.get("headline", parsed_data.get("summary")), parsed_data.get("summary"), parsed_data.get("keywords", []), parsed_data.get("entities", [])
                ))

            # Mark master row tracking update
            cur.execute("UPDATE raw_posts SET status = %s, classification_log = 'Success' WHERE post_id = %s;", (final_state, post_id))
            conn.commit()
            print(f"Record state resolved to: {final_state}")

        except Exception as err:
            conn.rollback()
            error_msg = f"{type(err).__name__}: {str(err)}"
            print(f"Extraction execution crash for item {post_id}. Logging and shifting pipeline.")
            cur.execute("UPDATE raw_posts SET status = 'FAILED', classification_log = %s WHERE post_id = %s;", (error_msg, post_id))
            conn.commit()
            
    cur.close()
    conn.close()
    print("\n Queue batch run sweep finished.")

if __name__ == "__main__":
    pipeline_sweep_batch()