const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function createDesk(previousStorage = new Map()) {
  const selectors = [
    "[data-clock]", "[data-shift-title]", "[data-shift]",
    '[data-action="advance"]', "[data-nav]", "[data-page]", "[data-status]"
  ];
  const nodes = Object.fromEntries(selectors.map((selector) => [selector, {
    textContent: "", innerHTML: "", hidden: false
  }]));
  const events = {};
  const root = {
    querySelector(selector) { return nodes[selector] || null; },
    addEventListener(event, handler) { events[event] = handler; }
  };
  const storage = {
    getItem(key) { return previousStorage.get(key) || null; },
    setItem(key, value) { previousStorage.set(key, value); }
  };
  class FakeFormData {
    constructor(form) { this.values = form.values; }
    get(key) { return this.values[key]; }
  }
  vm.runInNewContext(app, {
    document: { getElementById: () => root },
    localStorage: storage,
    FormData: FakeFormData
  }, { filename: "app.js" });
  return {
    storage: previousStorage,
    get page() { return nodes['[data-page]'].innerHTML; },
    get clock() { return nodes['[data-clock]'].textContent; },
    click(action, val = "") {
      events.click({ target: { closest: () => ({ dataset: { action, val } }) } });
    },
    submit(formType, values) {
      events.submit({
        preventDefault() {},
        target: {
          matches: (selector) => selector === '[data-' + formType + ']',
          values
        }
      });
    }
  };
}

test("Overview starts with an actionable pickup and no invented totals", () => {
  const desk = createDesk();
  assert.match(desk.page, /What needs attention now\?/);
  assert.match(desk.page, /Finish issuing the Film Society kit/);
  assert.match(desk.page, /No kit slips issued yet/);
  assert.match(desk.page, /Other loans out/);
  assert.match(desk.page, /of 3 approved equipment types/);
});

test("Complete pickup, partial return, morning closure and reload", () => {
  const desk = createDesk();
  desk.click("issue");
  assert.match(desk.page, /form data-issue/);
  ["PR-04", "SP-02", "AD-12"].forEach((asset, index) => {
    if (index) desk.click("new");
    desk.submit("issue", { req: "RQ-214", asset, who: "Kabir Sen", due: "Fri 8 pm" });
  });
  desk.click("tab", "Overview");
  assert.match(desk.page, /The screening kit is ready/);
  desk.click("go-notes");
  desk.submit("note", { note: "Kabir collected the kit." });
  desk.click("tab", "Overview");
  assert.match(desk.page, /Pickup recorded/);
  desk.click("advance");
  assert.match(desk.page, /Record the items Kabir brought back/);
  desk.click("show-loans");
  desk.click("return", "402");
  desk.click("return", "403");
  assert.match(desk.page, /2\/3/);
  desk.click("tab", "Overview");
  assert.match(desk.page, /Adapter AD-12 is still out/);
  assert.match(desk.page, /Still outstanding|On loan/);
  desk.click("go-notes");
  desk.submit("note", { note: "Leela has AD-12 until 9 am." });
  desk.click("tab", "Overview");
  assert.match(desk.page, /Partial return handed over/);
  desk.click("advance");
  assert.match(desk.page, /Close AD-12/);
  desk.click("show-loans");
  desk.click("return", "404");
  desk.click("tab", "Overview");
  assert.match(desk.page, /Film Society kit fully returned/);
  desk.click("show-all");
  assert.match(desk.page, /3\/3/);
  const reloaded = createDesk(desk.storage);
  assert.match(reloaded.page, /3\/3/);
  reloaded.click("restart");
  assert.match(reloaded.page, /What needs attention now\?/);
});

test("Links preserve the intent of the user's next action", () => {
  const desk = createDesk();
  desk.click("go-request");
  assert.match(desk.page, /RQ-214 · Approved/);
  desk.click("tab", "Overview");
  desk.click("show-loans");
  assert.match(desk.page, /Which items still need to come back\?/);
  desk.click("tab", "Overview");
  desk.click("go-notes");
  assert.match(desk.page, /What must the next shift know\?/);
});
