import sys
from playwright.sync_api import sync_playwright

def test_browser_fetch(handle):
    target_url = f"https://x.com/{handle}"
    print(f"🚀 Launching browser to visit: {target_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        page = context.new_page()
        
        try:
            # PIVOT: Changed wait_until to 'commit' (as soon as the server responds)
            page.goto(target_url, wait_until="commit", timeout=30000)
            
            print("⏳ Page initialized. Waiting specifically for tweets to load...")
            
            # STRATEGY: Wait explicitly for the first tweet element (<article>) to render
            page.wait_for_selector('article', timeout=15000)
            
            page_title = page.title()
            print(f"🎯 Successfully connected! Page Title: '{page_title}'")
            
            screenshot_path = "x_profile_snapshot.png"
            page.screenshot(path=screenshot_path)
            print(f"📸 Screenshot saved locally as: '{screenshot_path}'")
            
        except Exception as e:
            print(f"❌ Failed to load the page. Error: {e}")
            
        finally:
            browser.close()
            print("🔒 Browser closed.")

if __name__ == "__main__":
    test_browser_fetch("ShivAroor")