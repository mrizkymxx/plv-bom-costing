# -*- coding: utf-8 -*-
"""
Dogfood QA Automation Suite for PLV BOM Costing Web Application
Systematic exploratory testing using Playwright with genuine Chrome in ephemeral context.
Captures screenshots, tests UI interactions, verifies console errors, and compiles findings.
"""

import os
import json
import time
from playwright.sync_api import sync_playwright

OUT_DIR = r"C:\Users\M RIZKY\Desktop\PLV-BOM-Costing\dogfood-output"
SHOTS_DIR = os.path.join(OUT_DIR, "screenshots")
os.makedirs(SHOTS_DIR, exist_ok=True)

CHROME_BIN = r"C:\Program Files\Google/Chrome\Application\chrome.exe"
TARGET_URL = "https://plv-bom-costing.vercel.app"

issues = []
console_logs = []
page_errors = []

def log_issue(issue_id, title, severity, category, url, desc, steps, expected, actual, screenshot=None):
    issues.append({
        "id": issue_id,
        "title": title,
        "severity": severity,
        "category": category,
        "url": url,
        "description": desc,
        "steps": steps,
        "expected": expected,
        "actual": actual,
        "screenshot": screenshot
    })
    print(f"[{severity.upper()}] {issue_id}: {title}")

def main():
    print("="*70)
    print("STARTING DOGFOOD EXPLORATORY QA ON PLV BOM COSTING")
    print(f"Target: {TARGET_URL}")
    print("="*70)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_BIN,
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Capture console & uncaught errors
        page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        # -------------------------------------------------------------
        # STEP 1: INITIAL LOAD & HEADER INSPECTION
        # -------------------------------------------------------------
        print("\n--- STEP 1: Initial Page Load ---", flush=True)
        t0 = time.time()
        res = page.goto(TARGET_URL, wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        load_time = (time.time() - t0) * 1000
        print(f"Loaded HTTP {res.status} in {load_time:.1f}ms", flush=True)

        shot1 = os.path.join(SHOTS_DIR, "01_initial_dashboard.png")
        page.screenshot(path=shot1, full_page=True)
        print(f"Saved screenshot: {shot1}", flush=True)

        title = page.title()
        print(f"Page Title: {title}", flush=True)

        # Inspect DOM navigation tabs & interactive buttons
        buttons = page.query_selector_all("button, [role='tab'], nav a, .tab")
        print(f"Found {len(buttons)} interactive elements", flush=True)
        for i, b in enumerate(buttons):
            t = b.inner_text().replace("\n", " ").strip()
            if t:
                print(f"  Btn {i}: '{t[:40]}'", flush=True)

        # -------------------------------------------------------------
        # STEP 2: TEST KEY TABS & VIEWS
        # -------------------------------------------------------------
        print("\n--- STEP 2: Exploring Views ---", flush=True)
        for i, b in enumerate(buttons):
            t = b.inner_text().strip()
            # Only click non-download, navigational buttons
            if any(k in t.lower() for k in ["rate", "hardware", "cockpit", "cutlist", "bom", "summary", "detail", "item"]) and not any(skip in t.lower() for skip in ["download", "export"]):
                try:
                    print(f"Clicking tab: '{t}'", flush=True)
                    b.click(timeout=2000)
                    page.wait_for_timeout(800)
                    safe_name = "".join(c for c in t if c.isalnum())[:15]
                    page.screenshot(path=os.path.join(SHOTS_DIR, f"02_view_{safe_name}.png"))
                except Exception as e:
                    print(f"Click notice: {e}", flush=True)

        # -------------------------------------------------------------
        # STEP 3: RATE CARD COCKPIT FORM & INPUT VALIDATION
        # -------------------------------------------------------------
        print("\n--- STEP 3: Testing Inputs & Rate Card Cockpit ---")
        inputs = page.query_selector_all("input, select")
        print(f"Total input/select fields found: {len(inputs)}")

        # Check rate card inputs
        rate_inputs = page.query_selector_all("input[type='number'], input[inputmode='numeric']")
        if rate_inputs:
            first_input = rate_inputs[0]
            val_before = first_input.input_value()
            print(f"Testing numeric input mutation: initial value = '{val_before}'")
            
            # Test empty submission / negative value
            try:
                first_input.fill("-500")
                page.wait_for_timeout(300)
                val_after = first_input.input_value()
                # Check if UI prevents negative or gives feedback
                print(f"Negative input test: entered -500, value is '{val_after}'")
                # Restore
                first_input.fill(val_before)
            except Exception as e:
                print(f"Input error: {e}")

        # -------------------------------------------------------------
        # STEP 4: EXPORT / ACTIONS TESTING
        # -------------------------------------------------------------
        print("\n--- STEP 4: Testing Export & Actions ---", flush=True)
        export_buttons = [b for b in page.query_selector_all("button") if any(k in b.inner_text().lower() for k in ["export", "excel", "download"])]
        print(f"Found {len(export_buttons)} export button(s)", flush=True)
        for i, exp_btn in enumerate(export_buttons):
            txt = exp_btn.inner_text().replace("\n", " ").strip()
            print(f"Testing export action: '{txt}'", flush=True)
            try:
                exp_btn.click(timeout=3000)
                page.wait_for_timeout(1000)
                shot_exp = os.path.join(SHOTS_DIR, f"04_export_{i}.png")
                page.screenshot(path=shot_exp)
            except Exception as e:
                print(f"Export click notice: {e}", flush=True)

        # -------------------------------------------------------------
        # STEP 5: VISUAL & RESPONSIVE CHECKS
        # -------------------------------------------------------------
        print("\n--- STEP 5: Testing Mobile & Tablet Viewports ---")
        # Tablet Viewport (768 x 1024)
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(500)
        shot_tablet = os.path.join(SHOTS_DIR, "03_viewport_tablet.png")
        page.screenshot(path=shot_tablet)

        # Mobile Viewport (390 x 844 - iPhone 14)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(500)
        shot_mobile = os.path.join(SHOTS_DIR, "04_viewport_mobile.png")
        page.screenshot(path=shot_mobile)

        # Check for horizontal scroll / table overflow on mobile
        overflow_x = page.evaluate("() => document.documentElement.scrollWidth > window.innerWidth")
        print(f"Mobile horizontal overflow detected: {overflow_x}")
        if overflow_x:
            log_issue("BUG-VIS-01", "Mobile Horizontal Overflow", "Low", "Visual", TARGET_URL,
                      "Page body triggers horizontal scroll on small mobile viewports (390px)",
                      "Set viewport to 390x844 (iPhone 14)", "Content fits viewport or has dedicated overflow container",
                      "document.documentElement.scrollWidth exceeds window.innerWidth", shot_mobile)

        browser.close()

    print("\n" + "="*70)
    print("DOGFOOD EXPLORATORY QA EXECUTION FINISHED")
    print(f"Total Issues Logged: {len(issues)}")
    print(f"Total Console Logs Captured: {len(console_logs)}")
    print("="*70)

if __name__ == "__main__":
    main()
