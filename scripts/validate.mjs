// Checks the actual static export under a subpath. No external service is required.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.resolve("dist");
const out = path.resolve("test/scratch/interactions");
await fs.mkdir(out, { recursive: true });
const results = [];
const limitations = [];
const errors = [];
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".png": "image/webp",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const file = path.resolve(
    root,
    decodeURIComponent(url.pathname.replace(/^\/preview\//, "")) ||
      "index.html",
  );
  if (
    !url.pathname.startsWith("/preview/") ||
    !file.startsWith(root + path.sep)
  ) {
    res.writeHead(404).end();
    return;
  }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/preview/`;
let browser;
let checkName = "";
async function check(name, run) {
  checkName = name;
  await run();
  results.push({ name, passed: true });
  console.log(`PASS ${name}`);
}
async function idle(page) {
  await page.locator(".post-card, .empty-state").first().waitFor();
}
async function count(page, n) {
  await page.waitForFunction(
    (expected) => document.querySelectorAll(".post-card").length === expected,
    n,
  );
}
async function top(page) {
  await page
    .locator(".view-controls")
    .getByRole("button", { name: "Top tweets", exact: true })
    .click();
}
async function about(page) {
  await page
    .getByRole("button", { name: "About Swarmfeed", exact: true })
    .click();
}

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const remoteRequests = [];
  await context.route("**/*", (route) => {
    if (!route.request().url().startsWith(origin)) {
      remoteRequests.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(url);
  await idle(page);
  await check(
    "Eight real posts render; highest recorded likes first",
    async () => {
      await count(page, 8);
      assert.equal(
        await page.locator(".post-card").first().getAttribute("data-post-id"),
        "2117065610790379903",
      );
      assert.equal(await page.title(), "Swarmfeed · Top IdentityMD tweets");
    },
  );
  await check(
    "All assets local, images decoded, local font loaded",
    async () => {
      await page.evaluate(() => document.fonts.ready);
      assert.equal(
        await page.evaluate(() => document.fonts.check("400 16px Manrope")),
        true,
      );
      assert.equal(
        await page.evaluate(() =>
          [...document.images].every(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        ),
        true,
      );
      assert.deepEqual(remoteRequests, []);
    },
  );
  await check(
    "390px first screen contains product, Explore action, and original tweet link",
    async () => {
      for (const selector of [
        "h1",
        ".button-primary",
        ".post-card:first-child .x-link",
        ".post-card:first-child blockquote",
      ]) {
        const rect = await page.locator(selector).first().boundingBox();
        assert(
          rect && rect.y >= 0 && rect.y < 844,
          `${selector} should start on first screen`,
        );
      }
    },
  );
  await check("Explore tweets scrolls to feed and focuses search", async () => {
    await page
      .getByRole("button", { name: "Explore tweets", exact: true })
      .click();
    assert.equal(
      await page
        .locator("#tweet-search")
        .evaluate((el) => el === document.activeElement),
      true,
    );
  });
  await check("Search is case-insensitive and matches post text", async () => {
    await page.getByRole("searchbox").fill("IMDUEL");
    await count(page, 1);
    assert.equal(
      await page.locator(".post-card").getAttribute("data-post-id"),
      "2116986865442300030",
    );
  });
  await check(
    "Empty search explains recovery; clear returns focus and posts",
    async () => {
      await page.getByRole("searchbox").fill("nothing-matches-this");
      await count(page, 0);
      assert.match(
        await page.locator(".empty-state").innerText(),
        /nothing-matches-this/,
      );
      await page
        .getByRole("button", { name: "Clear search", exact: true })
        .click();
      await count(page, 8);
      assert.equal(
        await page
          .locator("#tweet-search")
          .evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check(
    "Topic filters show Building 3, Community 2, AI agents 3",
    async () => {
      for (const [topic, expected] of [
        ["Building", 3],
        ["Community", 2],
        ["AI agents", 3],
      ]) {
        await page
          .locator(".topic-controls")
          .getByRole("button", { name: topic, exact: true })
          .click();
        await count(page, expected);
      }
      await page
        .locator(".topic-controls")
        .getByRole("button", { name: "All", exact: true })
        .click();
      await count(page, 8);
    },
  );
  await check("Latest order uses publication timestamps", async () => {
    await page.getByRole("button", { name: "Latest", exact: true }).click();
    assert.deepEqual(
      await page
        .locator(".post-card")
        .evaluateAll((els) => els.slice(0, 3).map((el) => el.dataset.postId)),
      ["2117065610790379903", "2117000190552854544", "2116986865442300030"],
    );
  });
  await check(
    "Date range is anchored to snapshot and composes with topic/search",
    async () => {
      await page.getByLabel("Post date range").selectOption("week");
      await count(page, 7);
      await page
        .locator(".topic-controls")
        .getByRole("button", { name: "Community", exact: true })
        .click();
      await count(page, 1);
      await page.getByRole("searchbox").fill("winners");
      await count(page, 1);
      await page
        .getByRole("button", { name: "Reset filters", exact: true })
        .click();
      await count(page, 8);
      await top(page);
    },
  );
  await check("Empty saved list provides an Explore action", async () => {
    await page
      .locator(".view-controls")
      .getByRole("button", { name: "Saved", exact: true })
      .click();
    await count(page, 0);
    assert.match(await page.locator(".empty-state").innerText(), /this device/);
    await page
      .locator(".empty-state")
      .getByRole("button", { name: "Explore tweets", exact: true })
      .click();
    await count(page, 8);
  });
  await check(
    "Bookmark persists after reload and appears in Saved",
    async () => {
      await page
        .getByRole("button", { name: "Save Adam's tweet", exact: true })
        .click();
      assert.equal(
        await page
          .getByRole("button", { name: "Unsave Adam's tweet", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.reload();
      await idle(page);
      await page
        .locator(".view-controls")
        .getByRole("button", { name: "Saved", exact: true })
        .click();
      await count(page, 1);
      assert.equal(
        await page.locator(".post-card").getAttribute("data-post-id"),
        "2117065610790379903",
      );
    },
  );
  await check(
    "Unsave updates saved count and returns empty state",
    async () => {
      await page
        .getByRole("button", { name: "Unsave Adam's tweet", exact: true })
        .click();
      await count(page, 0);
      assert.deepEqual(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("swarmfeed.saved.v1")),
        ),
        [],
      );
      await top(page);
    },
  );
  await check(
    "Copy link writes original X URL and announces success",
    async () => {
      await page.evaluate(() =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.__copied = text;
            },
          },
        }),
      );
      await page
        .getByRole("button", { name: "Copy link to Adam's tweet", exact: true })
        .click();
      await page.waitForFunction(() => window.__copied);
      assert.equal(
        await page.evaluate(() => window.__copied),
        "https://x.com/surfcoderepeat/status/2117065610790379903",
      );
      assert.match(await page.getByRole("status").innerText(), /copied/);
    },
  );
  await check(
    "Clipboard denial offers selectable link; Escape restores trigger focus",
    async () => {
      await page.evaluate(() =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async () => {
              throw Error("denied");
            },
          },
        }),
      );
      const trigger = page.getByRole("button", {
        name: "Copy link to Adam's tweet",
        exact: true,
      });
      await trigger.click();
      await page.getByRole("dialog").waitFor();
      assert.equal(
        await page.getByLabel("Tweet link", { exact: true }).inputValue(),
        "https://x.com/surfcoderepeat/status/2117065610790379903",
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await trigger.evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check(
    "Snapshot details show recorded values and source URL",
    async () => {
      await page
        .getByRole("button", { name: "Snapshot details", exact: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      assert.match(await dialog.innerText(), /109/);
      assert.match(await dialog.innerText(), /3 Nov 2026/);
      assert.equal(
        await dialog
          .getByRole("link", { name: "View source mirror" })
          .getAttribute("href"),
        "https://teapawt.org/surfcoderepeat/status/2117065610790379903",
      );
      await page.getByRole("button", { name: "Close dialog" }).click();
    },
  );
  await check(
    "About dialog has source limits and traps keyboard focus",
    async () => {
      await about(page);
      const dialog = page.getByRole("dialog");
      assert.match(await dialog.innerText(), /not a complete ranking of X/);
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press("Tab");
        assert.equal(
          await page.evaluate(
            () => !!document.activeElement?.closest("dialog"),
          ),
          true,
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(
        await page
          .getByRole("button", { name: "About Swarmfeed", exact: true })
          .evaluate((el) => el === document.activeElement),
        true,
      );
    },
  );
  await check("Axe WCAG 2.2 AA checks on feed and open dialog", async () => {
    const feed = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    await about(page);
    const dialog = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    await fs.writeFile(
      path.join(out, "axe.json"),
      JSON.stringify(
        {
          feed: { violations: feed.violations, incomplete: feed.incomplete },
          dialog: {
            violations: dialog.violations,
            incomplete: dialog.incomplete,
          },
        },
        null,
        2,
      ),
    );
    assert.deepEqual(
      feed.violations.map((v) => v.id),
      [],
    );
    assert.deepEqual(
      dialog.violations.map((v) => v.id),
      [],
    );
    // Artwork contrast is separately sampled from rendered backgrounds. Other
    // incomplete results require review rather than being treated as a pass.
    assert.deepEqual(
      feed.incomplete.filter((v) => v.id !== "color-contrast").map((v) => v.id),
      [],
    );
    assert.deepEqual(
      dialog.incomplete.map((v) => v.id),
      [],
    );
    await page.keyboard.press("Escape");
  });
  await check(
    "All external links have expected destinations and safe new-tab attributes",
    async () => {
      const links = await page
        .locator('a[href^="http"]')
        .evaluateAll((elements) =>
          elements.map((el) => ({
            href: el.href,
            target: el.target,
            rel: el.rel,
          })),
        );
      for (const link of links) {
        assert(["x.com", "imd.fun"].includes(new URL(link.href).hostname));
        assert.equal(link.target, "_blank");
        assert.match(link.rel, /noopener/);
      }
    },
  );
  await check(
    "No horizontal overflow at 320, 390, 580, 768, 1024, 1440",
    async () => {
      for (const width of [320, 390, 580, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          true,
          `${width}px overflow`,
        );
        await page.screenshot({
          path: path.join(out, `viewport-${width}.png`),
          type: "png",
        });
      }
    },
  );
  await check("Desktop sidebar topic control updates feed", async () => {
    await page
      .locator(".radar-topics")
      .getByRole("button", { name: /Community/ })
      .click();
    await count(page, 2);
    await page.getByRole("button", { name: "Reset filters" }).click();
    await count(page, 8);
  });
  await check(
    "200% text enlargement reflows at 320, 390, and 1440",
    async () => {
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "32px";
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: path.join(out, `text-200-${width}.png`),
          type: "png",
        });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${width}px with enlarged text overflows`,
        );
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
      }
    },
  );
  await check("Keyboard skip link and visible search focus", async () => {
    await page.reload();
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".skip-link")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .locator("#feed")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.getByRole("searchbox").focus();
    assert.equal(
      await page
        .getByRole("searchbox")
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "solid",
    );
    await page.screenshot({
      path: path.join(out, "keyboard-focus.png"),
      type: "png",
    });
  });
  await check(
    "Reduced motion disables transitions and keeps interactions usable",
    async () => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(
        await page
          .locator(".button-primary")
          .first()
          .evaluate((el) => getComputedStyle(el).transitionDuration),
        "0s",
      );
      await page.getByRole("searchbox").fill("chess");
      await count(page, 1);
      await page.getByRole("button", { name: "Clear search" }).click();
      await count(page, 8);
    },
  );
  await check(
    "Long query is safely rendered as text and can be cleared",
    async () => {
      await page.setViewportSize({ width: 320, height: 844 });
      await page
        .getByRole("searchbox")
        .fill("<script>alert(1)</script>" + "x".repeat(150));
      await count(page, 0);
      assert.equal(await page.locator(".empty-state script").count(), 0);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.getByRole("button", { name: "Clear filters" }).click();
      await count(page, 8);
    },
  );
  await check(
    "Corrupted bookmark storage recovers without crashing",
    async () => {
      await page.evaluate(() =>
        localStorage.setItem("swarmfeed.saved.v1", "{broken-json"),
      );
      await page.reload();
      await count(page, 8);
      assert.match(
        await page.getByRole("status").innerText(),
        /storage is unavailable/,
      );
      await page
        .getByRole("button", { name: "Save Adam's tweet", exact: true })
        .click();
      assert.deepEqual(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("swarmfeed.saved.v1")),
        ),
        ["2117065610790379903"],
      );
    },
  );
  await check(
    "Storage denial keeps bookmarks in memory and explains limitation",
    async () => {
      const blocked = await context.newPage();
      await blocked.addInitScript(() => {
        Storage.prototype.getItem = () => {
          throw Error("blocked");
        };
        Storage.prototype.setItem = () => {
          throw Error("blocked");
        };
      });
      await blocked.goto(url);
      await idle(blocked);
      await blocked
        .getByRole("button", { name: "Save Adam's tweet", exact: true })
        .click();
      assert.match(
        await blocked.getByRole("status").innerText(),
        /for this visit/,
      );
      await blocked
        .locator(".view-controls")
        .getByRole("button", { name: "Saved", exact: true })
        .click();
      await count(blocked, 1);
      await blocked.close();
    },
  );
  await check("Bookmarks synchronize across tabs", async () => {
    const other = await context.newPage();
    await other.goto(url);
    await idle(other);
    await other.evaluate(() =>
      localStorage.setItem("swarmfeed.saved.v1", "[]"),
    );
    await page.waitForFunction(() =>
      document.querySelector('[aria-label="Save Adam\'s tweet"]'),
    );
    await other.close();
  });
  await check(
    "No console, script, failed resource, or remote runtime requests",
    async () => {
      assert.deepEqual(errors, []);
      assert.deepEqual(remoteRequests, []);
    },
  );
  await context.close();
  await browser.close();
  browser = null;

  let safari;
  try {
    safari = await webkit.launch({ headless: true });
  } catch (error) {
    limitations.push(
      `WebKit could not launch: ${
        String(error.message)
          .split("\n")
          .filter((line) => /missing|libgtk|dependencies/.test(line))
          .join(" ")
          .slice(0, 500) || "native browser libraries unavailable"
      }`,
    );
  }
  if (safari) {
    try {
      const safariPage = await safari.newPage({
        viewport: { width: 390, height: 844 },
      });
      await check(
        "WebKit primary search, bookmark, and dialog flow",
        async () => {
          await safariPage.goto(url);
          await count(safariPage, 8);
          await safariPage.getByRole("searchbox").fill("chess");
          await count(safariPage, 1);
          await safariPage
            .getByRole("button", { name: "Save Nitro Slav's tweet" })
            .click();
          await safariPage
            .locator(".view-controls")
            .getByRole("button", { name: "Saved", exact: true })
            .click();
          await count(safariPage, 1);
          await about(safariPage);
          await safariPage.getByRole("dialog").waitFor();
          await safariPage.keyboard.press("Escape");
        },
      );
    } finally {
      await safari.close();
    }
  }
} catch (error) {
  results.push({
    name: checkName || "setup",
    passed: false,
    error: String(error.stack || error),
  });
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.writeFile(
    path.join(out, "results.json"),
    JSON.stringify({ results, limitations }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        limitations,
      },
      null,
      2,
    ),
  );
}
