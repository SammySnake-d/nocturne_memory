from playwright.sync_api import sync_playwright
import time
import re

def measure_performance(output_file="verification/optimized_perf.txt", screenshot_path="verification/optimized.png"):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))

        start_time = time.time()
        page.goto("http://localhost:3000/test-perf")

        # Wait for the render time to appear
        try:
            page.wait_for_selector("text=Initial Render Time (approx):", timeout=10000)
        except Exception as e:
            print(f"Error waiting for render time: {e}")
            page.screenshot(path="verification/error.png")
            browser.close()
            return

        # Extract the render time from the text
        content = page.content()
        match = re.search(r"Initial Render Time \(approx\): ([\d\.]+) ms", content)
        if match:
            render_time = match.group(1)
            print(f"Render Time: {render_time} ms")
            with open(output_file, "w") as f:
                f.write(f"Render Time: {render_time} ms\n")
        else:
            print("Could not find render time in page content.")

        page.screenshot(path=screenshot_path)
        browser.close()

if __name__ == "__main__":
    measure_performance()
