import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createContext, SourceTextModule } from "node:vm";

const source = await readFile(new URL("../src/data/trackVisitor.js", import.meta.url), "utf8");
const WEBHOOK_URL = "https://discord.com/api/webhooks/test/mock-token";
const NOTIFIED_KEY = "mv_first_visit_notified_v2";

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function makeLocks() {
  let pending = Promise.resolve();
  return {
    request(_name, callback) {
      const result = pending.then(callback);
      pending = result.catch(() => {});
      return result;
    },
  };
}

async function createPage({
  storage = makeStorage(),
  webhookUrl = WEBHOOK_URL,
  locks,
  visibility = "visible",
  pathname = "/",
  send = async () => ({ ok: true, status: 204 }),
  lookup = async () => ({ ok: true, json: async () => ({ ip: "192.0.2.1" }) }),
} = {}) {
  const requests = [];
  const notifications = [];
  const context = createContext({
    URL,
    URLSearchParams,
    localStorage: storage,
    window: {
      location: { pathname, search: "", href: `https://example.test${pathname}` },
      innerWidth: 1280,
      innerHeight: 720,
    },
    document: { visibilityState: visibility, referrer: "" },
    navigator: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0.0.0",
      language: "en-US",
      languages: ["en-US"],
      maxTouchPoints: 0,
      locks,
    },
    screen: { width: 1280, height: 720, colorDepth: 24 },
    fetch: async (url, options) => {
      requests.push(url);
      if (url === webhookUrl) {
        notifications.push(JSON.parse(options.body));
        return send();
      }
      return lookup();
    },
  });
  const module = new SourceTextModule(source, {
    context,
    initializeImportMeta(meta) {
      meta.env = { VITE_DISCORD_WEBHOOK_URL: webhookUrl };
    },
  });
  await module.link(() => { throw new Error("Unexpected import"); });
  await module.evaluate();
  return { track: module.namespace.default, storage, requests, notifications };
}

test("a new browser sends one first-visit alert and repeated entries stay quiet", async () => {
  const page = await createPage();
  await page.track({ label: "Let Me In button" });
  await page.track();
  await page.track();

  assert.equal(page.notifications.length, 1);
  assert.equal(page.storage.getItem(NOTIFIED_KEY), "1");
  const embed = page.notifications[0].embeds[0];
  assert.match(embed.title, /First Visit/);
  assert.match(embed.fields[0].value, /New visitor/);
  assert.match(embed.footer.text, /Let Me In button/);
});

test("refreshing or reopening a browser skips notification and geo lookup", async () => {
  const storage = makeStorage();
  const first = await createPage({ storage });
  await first.track();

  for (let visit = 0; visit < 3; visit++) {
    const reopened = await createPage({ storage });
    await reopened.track();
    assert.equal(reopened.requests.length, 0);
  }
});

test("another browser has its own first-visit notification", async () => {
  const first = await createPage();
  const second = await createPage();
  await first.track();
  await second.track();
  assert.equal(first.notifications.length, 1);
  assert.equal(second.notifications.length, 1);
});

test("old history is cleared, permits one fresh alert, and later entries stay quiet", async () => {
  const storage = makeStorage({
    mv_visit_count: "3",
    mv_first_visit_notified: "1",
    mv_visitor_id: "VIS-existing",
  });
  const page = await createPage({ storage });
  await page.track();
  assert.equal(page.notifications.length, 1);
  assert.equal(storage.getItem("mv_visit_count"), null);
  assert.equal(storage.getItem("mv_first_visit_notified"), null);
  assert.equal(storage.getItem("mv_visitor_id"), "VIS-existing");
  assert.equal(storage.getItem(NOTIFIED_KEY), "1");

  const reopened = await createPage({ storage });
  await reopened.track();
  assert.equal(reopened.requests.length, 0);
});

test("overlapping calls in the same tab send only once", async () => {
  const page = await createPage();
  await Promise.all([page.track(), page.track(), page.track()]);
  assert.equal(page.notifications.length, 1);
});

test("simultaneous first entries in separate tabs send only once with Web Locks", async () => {
  const options = { storage: makeStorage(), locks: makeLocks() };
  const first = await createPage(options);
  const second = await createPage(options);
  await Promise.all([first.track(), second.track()]);
  assert.equal(first.notifications.length + second.notifications.length, 1);
});

test("an unsuccessful Discord response can retry after reopening", async () => {
  const storage = makeStorage();
  const failed = await createPage({ storage, send: async () => ({ ok: false, status: 404 }) });
  await failed.track();
  assert.notEqual(storage.getItem(NOTIFIED_KEY), "1");

  const retry = await createPage({ storage });
  await retry.track();
  assert.equal(retry.notifications.length, 1);
  assert.equal(storage.getItem(NOTIFIED_KEY), "1");
});

test("network failure does not prevent a later successful first notification", async () => {
  let fail = true;
  const page = await createPage({ send: async () => {
    if (fail) throw new Error("Offline");
    return { ok: true, status: 204 };
  } });
  await page.track();
  assert.notEqual(page.storage.getItem(NOTIFIED_KEY), "1");
  fail = false;
  await page.track();
  await page.track();
  assert.equal(page.notifications.length, 2); // One failed attempt, one delivered alert.
  assert.equal(page.storage.getItem(NOTIFIED_KEY), "1");
});

test("blocked geolocation still allows one first-visit alert", async () => {
  const page = await createPage({ lookup: async () => { throw new Error("Blocked"); } });
  await page.track();
  await page.track();
  assert.equal(page.notifications.length, 1);
  assert.equal(page.storage.getItem(NOTIFIED_KEY), "1");
});

for (const operation of ["getItem", "setItem", "removeItem"]) {
  test(`unavailable storage (${operation}) skips tracking without breaking entry`, async () => {
    const storage = makeStorage();
    storage[operation] = () => { throw new Error("Storage blocked"); };
    const page = await createPage({ storage });
    await page.track();
    await page.track();
    assert.equal(page.requests.length, 0);
  });
}

for (const [name, options] of [
  ["unconfigured webhook", { webhookUrl: "" }],
  ["placeholder webhook", { webhookUrl: "PASTE_YOUR_NEW_DISCORD_WEBHOOK_HERE" }],
  ["hidden page", { visibility: "hidden" }],
  ["excluded path", { pathname: "/admin" }],
]) {
  test(`${name} does not track visitors`, async () => {
    const page = await createPage(options);
    await page.track();
    assert.equal(page.requests.length, 0);
    assert.equal(page.storage.getItem(NOTIFIED_KEY), null);
  });
}
