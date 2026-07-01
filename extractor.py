import sys
from playwright.sync_api import sync_playwright

def resilient_tweet_extractor(handle):
    target_url = f"https://x.com/{handle}"
    print(f"🚀 Running resilient extractor for: {target_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            page.goto(target_url, wait_until="commit", timeout=30000)
            page.wait_for_selector('article', timeout=15000)
            page.wait_for_timeout(2000) # Allow full rendering
            
            first_tweet = page.query_selector('article')
            if not first_tweet:
                print("❌ Failed to isolate tweet container.")
                return

            # Initialize our target data structure
            final_text = None
            final_date = None

            # --- LAYER 1: Try Standard Selectors ---
            text_element = first_tweet.query_selector('[data-testid="tweetText"]')
            time_element = first_tweet.query_selector('time')

            if text_element:
                final_text = text_element.inner_text()
            if time_element:
                final_date = time_element.get_attribute('datetime')

            # --- LAYER 2: Positional Fallback Parser ---
            if not final_text or not final_date:
                print("⚠️ Selectors stripped by X. Activating Positional Fallback...")
                
                # Extract all text elements flattened in order of visual layout
                raw_text = first_tweet.inner_text()
                
                # Split text into lines, strip whitespace, and filter out empty lines
                lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
                
                if len(lines) >= 4:
                    # In a standard layout:
                    # lines[0] = Display Name ("Shiv Aroor")
                    # lines[1] = Handle ("@ShivAroor")
                    # lines[2] = Date String ("Jan 10, 2025")
                    # lines[3] = Actual Tweet Text
                    final_date = lines[2]
                    final_text = lines[3]
                    print("⚡ Positional Fallback successfully captured the data!")

            # Print out our fully recovered data payload
            print("\n=== Final Extracted Payload ===")
            print(f"⏰ Date/Timestamp: {final_date}")
            print(f"📝 Cleaned Text:   \"{final_text}\"")
            print("===============================\n")

        except Exception as e:
            print(f"❌ Error during extraction: {e}")
            
        finally:
            browser.close()
            print("🔒 Browser closed.")

if __name__ == "__main__":
    resilient_tweet_extractor("ShivAroor")