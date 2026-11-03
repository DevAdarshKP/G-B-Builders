import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const OUT_DIR = path.resolve("scratch_shots");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function httpPutJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: "PUT" }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === "Runtime.consoleAPICalled") {
          this.consoleLogs.push({
            type: msg.params.type,
            text: msg.params.args.map((a) => a.value || JSON.stringify(a)).join(" "),
          });
        }
        if (msg.method === "Runtime.exceptionThrown") {
          this.consoleLogs.push({
            type: "exception",
            text: msg.params.exceptionDetails.text,
          });
        }
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  console.log("Launching Headless Chrome with CDP...");
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--window-size=1440,900",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  try {
    // Wait for CDP to be ready
    let target = null;
    for (let i = 0; i < 30; i++) {
      await delay(300);
      try {
        const list = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
        if (list && list.length > 0) {
          target = list[0];
          break;
        }
      } catch (e) {}
    }

    if (!target) {
      throw new Error("Failed to connect to Chrome DevTools port");
    }

    const cdp = new CDPClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log("Navigating to http://localhost:3000 ...");
    await cdp.send("Page.navigate", { url: "http://localhost:3000" });

    // Wait for load event
    await delay(2500);

    async function capture(filename) {
      const res = await cdp.send("Page.captureScreenshot", { format: "png" });
      const filePath = path.join(OUT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, "base64"));
      console.log(`Saved screenshot: ${filePath}`);
    }

    async function evaluate(expression) {
      const res = await cdp.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: false,
      });
      return res?.result?.value;
    }

    // 1. Initial State
    console.log("Capturing initial state...");
    await capture("01_desktop_hero.png");

    // 2. Scroll into Before/After section
    console.log("Scrolling to Before/After...");
    await evaluate(`window.scrollTo({ top: 1200, behavior: 'instant' });`);
    await delay(1000);
    await capture("02_before_after.png");

    // 3. Scroll into About Company
    console.log("Scrolling to About Company...");
    await evaluate(`
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await delay(1200);
    await capture("03_about_company.png");

    // 4. Scroll into Services
    console.log("Scrolling to Services...");
    await evaluate(`
      const el = document.getElementById('services');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await delay(1200);
    await capture("04_services_intro.png");

    // 5. Scroll down to Service Row 1 and 2
    console.log("Scrolling into Service Rows...");
    await evaluate(`window.scrollBy({ top: 400, behavior: 'instant' });`);
    await delay(1000);
    await capture("05_service_rows.png");

    // 6. Scroll into Portfolio
    console.log("Scrolling to Portfolio...");
    await evaluate(`
      const el = document.getElementById('portfolio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await delay(1200);
    await capture("06_portfolio_start.png");

    // 7. Scroll horizontally along Portfolio track
    console.log("Scrolling along pinned Portfolio track...");
    await evaluate(`window.scrollBy({ top: 800, behavior: 'instant' });`);
    await delay(1000);
    await capture("07_portfolio_scrubbed.png");

    // 8. Scroll to Final Section ("Creating a Cozy Interior")
    console.log("Scrolling to Final Section...");
    await evaluate(`
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await delay(1200);
    await capture("08_final_interior.png");

    // 9. Reverse Scroll test: Scroll back to top
    console.log("Testing Reverse Scroll...");
    await evaluate(`window.scrollTo({ top: 0, behavior: 'instant' });`);
    await delay(1500);
    await capture("09_reverse_scroll_hero.png");

    // 10. Tablet viewport test
    console.log("Testing Tablet Viewport (768x1024)...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(800);
    await evaluate(`window.scrollTo({ top: 1800, behavior: 'instant' });`);
    await delay(1000);
    await capture("10_tablet_about.png");

    // 11. Mobile viewport test
    console.log("Testing Mobile Viewport (375x812)...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(800);
    await evaluate(`window.scrollTo({ top: 2200, behavior: 'instant' });`);
    await delay(1000);
    await capture("11_mobile_services.png");

    // Check horizontal overflow on mobile
    const overflowX = await evaluate(`
      document.documentElement.scrollWidth > window.innerWidth
    `);
    console.log("Mobile horizontal overflow detected:", overflowX);

    // Console logs summary
    console.log("Browser console logs captured:", cdp.consoleLogs.length);
    cdp.consoleLogs.forEach((log) => {
      console.log(`[${log.type}] ${log.text}`);
    });

    cdp.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
