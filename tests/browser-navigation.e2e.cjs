const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const repoRoot = path.resolve(__dirname, "..");
const siteRoot = path.join(repoRoot, "site");
let server;
let browser;
let origin;

test("published Main/Sub Pages render as grouped navigation links in a real browser", async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname.replace(/^\/3btechhub\/?/, "");
    const base = relative.startsWith("tests/fixtures/") ? repoRoot : siteRoot;
    const file = path.resolve(base, relative || "index.html");
    if (!file.startsWith(base + path.sep) && file !== path.join(base, "index.html")) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(file);
    res.setHeader("content-type", ext === ".js" ? "text/javascript; charset=utf-8" : ext === ".html" ? "text/html; charset=utf-8" : "application/octet-stream");
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  origin = "http://127.0.0.1:" + server.address().port;
  try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(origin + "/3btechhub/tests/fixtures/navigation.html");
  await page.waitForFunction(() => document.documentElement.dataset.testReady === "true");
  const links = await page.locator(".menu-dynamic-pages a").evaluateAll(nodes => nodes.map(node => ({
    text: node.textContent,
    href: new URL(node.href).pathname
  })));
  assert.deepEqual(links.map(link => link.text), ["About Us", "Our Team"]);
  assert.equal(links[0].href, "/3btechhub/about-us/");
  assert.equal(links[1].href, "/3btechhub/about-us/our-team/");
  assert.deepEqual(errors, []);

  await page.goto(origin + "/3btechhub/tests/fixtures/dynamic-page.html");
  await page.waitForFunction(() => document.documentElement.dataset.testReady === "true");
  assert.equal(await page.locator("#preview h1").textContent(), "Safe Dynamic Page");
  assert.equal(await page.locator("#preview h2").textContent(), "<img src=x onerror=alert(1)>");
  assert.equal(await page.locator("#preview img").count(), 0);
  assert.deepEqual(errors, []);

  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
});
