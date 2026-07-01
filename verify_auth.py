import os
import sys
from playwright.sync_api import sync_playwright

def run_preflight_check():
    state_file = "auth_state.json"
    print("🔍 Initializing Pre-Flight Authentication Probe...")
    
    if not os.path.exists(state_file):
        print(f"❌ CRITICAL FAILURE: '{state_file}' not found in the current directory.")
        print("👉 Please ensure you have created the file and populated your cookie data.")
        sys.exit(1)

    with sync_playwright() as p:
        # Launching visibly (headless=False) so you can watch the probe execution
        browser = p.chromium.launch(headless=False, slow_mo=500)
        
        # Hydrate the browser context with your manual cookie tokens
        context = browser.new_context(
            storage_state=state_file,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            print("🌐 Navigating to X secure gateway (x.com/home)...")
            page.goto("https://x.com/home", wait_until="commit", timeout=25000)
            
            # Wait up to 7 seconds to see if authenticated dashboard elements render
            print("👀 Inspecting DOM for authenticated UI markers...")
            page.wait_for_selector('[data-testid="SideNav_AccountSwitcher_Button"]', timeout=7000)
            
            # Double check current active URL destination
            current_url = page.url
            
            if "login" in current_url or "flow" in current_url:
                print(f"❌ PROBE FAILED: Server issued an auth-eviction redirect to: {current_url}")
                print("⚠️ Your cookies were rejected by X. They may be expired, corrupted, or copied incorrectly.")
                sys.exit(1)
                
            print("\n========================================================")
            print("🚀 PRE-FLIGHT VERIFICATION: SUCCESS!")
            print(f"🔐 Valid session confirmed. Current landing node: {current_url}")
            print("========================================================\n")
            
        except Exception as e:
            print("\n========================================================")
            print("❌ PRE-FLIGHT VERIFICATION: FAILED")
            print("========================================================")
            print(f"🚨 Reason: Authenticated UI components failed to render within the time window.")
            print("👉 This usually means X blocked the session or redirected to a login wall.")
            print(f"📋 Debug info: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_preflight_check()