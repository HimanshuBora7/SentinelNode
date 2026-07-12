import os
import sys
import traceback
import psycopg2
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"), user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"), host=os.getenv("DB_HOST"), port=os.getenv("DB_PORT")
    )

def log_pipeline_health(handle, status, error_msg=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO source_health (account_handle, status, error_message) VALUES (%s, %s, %s);", (handle, status, error_msg))
        conn.commit()
    except Exception as e: 
        print(f"Telemetry failure: {e}")
    finally:
        cur.close()
        conn.close()

def run_ingestion_pipeline(handles):
    state_file = "auth_state.json"
    
    if not os.path.exists(state_file):
        print(f" Aborting: '{state_file}' missing. Run your auth configuration setup first.")
        return

    with sync_playwright() as p:
        print(f"launching ultra-stealth, resource-optimized browser context for {len(handles)} targets...")
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context(
            storage_state=state_file,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # Resource Optimization: Block images, media, and fonts to save massive bandwidth and load instantly
        page.route("**/*", lambda route: route.abort() 
            if route.request.resource_type in ["image", "media", "font"] 
            else route.continue_())

        import random
        #Stealth Enhancement: Randomize the order of handles every single cycle
        random.shuffle(handles)

        for index, handle in enumerate(handles):
            target_url = f"https://x.com/{handle}"
            print(f"\n [{index+1}/{len(handles)}] Starting Pipeline for: @{handle}")
            extracted_payloads = []
            
            try:
                # Pre-Fetch: Get the latest known post_id for this handle to fast-fail if there are no new tweets
                db_connection = get_db_connection()
                db_cursor = db_connection.cursor()
                db_cursor.execute("SELECT post_id FROM raw_posts WHERE account_handle = %s ORDER BY timestamp DESC LIMIT 1;", (handle,))
                latest_db_post = db_cursor.fetchone()
                db_cursor.close()
                db_connection.close()
                latest_known_id = latest_db_post[0] if latest_db_post else None

                page.goto(target_url, wait_until="commit", timeout=30000)
                page.wait_for_selector('article', timeout=15000)
                page.wait_for_timeout(2000)
                
                visible_tweets = page.query_selector_all('article')
                
                # Filter out pinned tweets and grab the top 3 real tweets
                valid_tweets = []
                for t in visible_tweets:
                    text_content = t.inner_text()
                    if text_content and "Pinned" in text_content[:50]:
                        print("Skipping pinned tweet...")
                        continue
                    valid_tweets.append(t)
                    if len(valid_tweets) >= 3:
                        break
                
                tweet_window = valid_tweets
                print(f"Isolated top {len(tweet_window)} visible authenticated feed items. Parsing...")

                for t_index, tweet_container in enumerate(tweet_window):
                    payload = {"post_id": None, "account_handle": handle, "text": None, "timestamp": None, "post_url": None, "media_urls": []}
                    
                    link_elements = tweet_container.query_selector_all('a')
                    for link in link_elements:
                        href = link.get_attribute('href')
                        if href and '/status/' in href:
                            payload["post_url"] = f"https://x.com{href.split('?')[0]}"
                            payload["post_id"] = href.split('/status/')[-1].split('?')[0]
                            break
                            
                    #  Fast-Fail Optimization: Stop parsing this handle if we hit a tweet we already have
                    if latest_known_id and payload["post_id"] == latest_known_id:
                        print("Reached known database state. Aborting further extraction for this handle.")
                        break

                    time_element = tweet_container.query_selector('time')
                    if time_element:
                        payload["timestamp"] = time_element.get_attribute('datetime')

                    text_element = tweet_container.query_selector('[data-testid="tweetText"]')
                    if text_element:
                        payload["text"] = text_element.inner_text().strip()
                    else:
                        payload["text"] = "[Media Only or No Content text parsed]"

                    if payload["post_id"] and payload["timestamp"]:
                        extracted_payloads.append(payload)
                    else:
                        print(f"Container index {t_index} skipped. Missing essential routing fields.")

            except Exception as e:
                error_trace = traceback.format_exc()
                log_pipeline_health(handle, "FAILED", error_trace)
                print(f"Scraper extraction execution failure for {handle}.")
                continue

            # --- Database Transaction Sink Loop ---
            if not extracted_payloads:
                log_pipeline_health(handle, "EMPTY", "No semantic payloads resolved.")
            else:
                db_connection = get_db_connection()
                db_cursor = db_connection.cursor()
                new_inserts = 0
                duplicate_hits = 0

                try:
                    for payload in extracted_payloads:
                        db_cursor.execute("""
                            INSERT INTO raw_posts (post_id, account_handle, text, timestamp, post_url, media_urls)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (post_id) DO NOTHING;
                        """, (
                            payload["post_id"], payload["account_handle"], payload["text"],
                            payload["timestamp"], payload["post_url"], payload["media_urls"]
                        ))
                        
                        if db_cursor.rowcount > 0:
                            new_inserts += 1
                            print(f"LIVE POST INGESTED: [{payload['post_id']}]")
                        else:
                            duplicate_hits += 1

                    db_connection.commit()
                    
                    if new_inserts > 0:
                        log_pipeline_health(handle, "SUCCESS")
                        print(f"Summary: Synchronized {new_inserts} live semantic rows, skipped {duplicate_hits} historical items.")
                    else:
                        log_pipeline_health(handle, "DUPLICATE")
                        print(f"ℹSummary: All {duplicate_hits} window items match active database schema state.")
                        
                except Exception as db_error:
                    log_pipeline_health(handle, "FAILED", f"Database ingestion failure on semantic layout: {db_error}")
                    print(f"Database synchronization failed for {handle}.")
                finally:
                    db_cursor.close()
                    db_connection.close()

            # Random Jitter between profiles inside the same browser context to look human
            if index < len(handles) - 1:
                import time
                import random
                jitter = random.randint(5, 12)
                print(f"💤 Profile complete. Safely jittering for {jitter} seconds before navigating to next target...")
                time.sleep(jitter)

        browser.close()

if __name__ == "__main__":
    run_ingestion_pipeline(["ShivAroor"])