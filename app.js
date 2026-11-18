(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Overview", "package-open"],
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 1,
    tab: "Overview",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";

  // One question per view: show the current action before operational details.
  // Every figure below comes from the same fictional slips used by the register.
  function overview() {
    const film = getReq("RQ-214");
    const slips = s.loans.filter((loan) => loan.req === film.id);
    const issuedTypes = new Set(slips.map((loan) => getAsset(loan.asset).type));
    const missingTypes = film.items.filter((type) => !issuedTypes.has(type));
    const returned = slips.filter((loan) => loan.back).length;
    const openKit = slips.filter((loan) => !loan.back);
    const otherOpen = s.loans.filter((loan) => loan.req !== film.id && !loan.back).length;
    const notedThisPhase = s.notes.some((note) => note.phase === s.phase);

    let title, explanation, action, label, tone = "action";
    if (missingTypes.length) {
      title = "Finish issuing the Film Society kit";
      explanation = missingTypes.length + " approved " +
        (missingTypes.length === 1 ? "item has" : "items have") +
        " no issue slip: " + missingTypes.join(", ") + ". Check the inventory before Kabir leaves.";
      action = "issue"; label = "Create issue slip";
    } else if (s.phase === 0 && !notedThisPhase) {
      title = "The screening kit is ready";
      explanation = "All three approved units have issue slips. Record Kabir's pickup for the next shift.";
      action = "go-notes"; label = "Add pickup note";
      tone = "ready";
    } else if (s.phase === 0) {
      title = "Pickup recorded — move to the return";
      explanation = "The full kit is issued and the handover note is saved. Advance the sample time when ready.";
      action = "advance"; label = "Move to return time";
      tone = "ready";
    } else if (s.phase === 1 && openKit.some((loan) => ["PR-04", "SP-02"].includes(loan.asset))) {
      title = "Record the items Kabir brought back";
      explanation = "The projector and speaker have arrived. Close their slips; AD-12 stays out with Leela.";
      action = "show-loans"; label = "Record partial returns";
    } else if (s.phase === 1 && openKit.length && !notedThisPhase) {
      title = "Adapter " + openKit.map((loan) => loan.asset).join(", ") + " is still out";
      explanation = "Kabir returned the projector and speaker. Leave a note that Leela will drop off the remaining unit at 9 am tomorrow.";
      action = "go-notes"; label = "Write handover note";
    } else if (s.phase === 1) {
      title = openKit.length ? "Partial return handed over" : "All kit items have been returned";
      explanation = "The returns and handover can now be reviewed by the morning shift.";
      action = "advance"; label = "Move to next morning";
      tone = "ready";
    } else if (openKit.length) {
      title = "Close " + openKit.map((loan) => loan.asset).join(", ") + "'s return";
      explanation = "Leela is at the counter. Confirm the physical unit and record the outstanding return under RQ-214.";
      action = "show-loans"; label = "Open outstanding slips";
    } else {
      title = "Film Society kit fully returned";
      explanation = "All " + slips.length + " issued units are back. The Debate Union microphone is tracked separately.";
      action = "show-all"; label = "Review closed slips";
      tone = "ready";
    }

    const metric = (label, value, denominator, sub, percent) =>
      '<div class="metric"><span class="metric-label">' + esc(label) + '</span>' +
      '<div class="metric-value"><strong>' + esc(value) + '</strong>' +
      (denominator === null ? '' : '<span> / ' + esc(denominator) + '</span>') +
      '</div><small>' + esc(sub) + '</small>' +
      (percent === null ? '' : '<div class="metric-track" role="progressbar" aria-label="' +
        esc(label) + '" aria-valuemin="0" aria-valuemax="' + esc(denominator) +
        '" aria-valuenow="' + esc(value) + '"><span style="width:' + percent + '%"></span></div>') +
      '</div>';

    let result = head("What needs attention now?", "One desk · Film Society request RQ-214");
    result += '<section class="priority-panel" data-tone="' + esc(tone) +
      '" aria-label="Recommended next action"><small class="priority-label">' +
      (tone === "ready" ? "STEP COMPLETED" : "NEXT ACTION") +
      ' · ' + esc(shifts[s.phase].time) + '</small><h3>' +
      esc(title) + '</h3><p>' + esc(explanation) + '</p>' +
      '<div class="priority-actions">' + btn(label, action, "", "primary") +
      btn("View approved request", "go-request", "", "quiet-action") +
      '</div></section>';

    result += '<div class="metrics" aria-label="Live sample shift metrics">' +
      metric("Kit issued", issuedTypes.size, film.items.length,
        "of 3 approved equipment types", 100 * issuedTypes.size / film.items.length) +
      metric("Kit returned", returned, slips.length, slips.length
        ? "of " + slips.length + " issued units" : "No kit slips issued yet",
        slips.length ? 100 * returned / slips.length : null) +
      metric("Other loans out", otherOpen, null,
        "physical units outside RQ-214", null) +
      '</div>';

    result += '<div class="overview-detail"><section class="overview-equipment"><div class="overview-section-head">' +
      '<div><h3>Film Society equipment</h3><small>Unit status · current sample shift</small></div>' +
      btn("Open loan register", "show-loans", "", "quiet-action") + '</div><ul class="equipment-list">';
    for (const type of film.items) {
      const matches = slips.filter((loan) => getAsset(loan.asset).type === type);
      const active = matches.find((loan) => !loan.back);
      const chosen = active || matches[matches.length - 1];
      const status = !chosen ? "Not issued" : active ? "On loan" : "Returned";
      const style = status === "Returned" ? "is-done" : status === "On loan" ? "is-out" : "is-pending";
      result += '<li><div><strong>' + esc(type) + '</strong><small>' +
        esc(chosen ? chosen.asset : "Approved · no slip yet") + '</small></div>' +
        '<span class="status-label ' + style + '">' + esc(status) + '</span></li>';
    }
    result += '</ul></section><section class="overview-handover">' +
      '<h3>Latest handover</h3><small>From the Desk book · sample data</small>';
    const note = s.notes[s.notes.length - 1];
    if (note) {
      result += '<p class="handover-quote">' + esc(note.text) + '</p>' +
        '<small>Staff note · ' + esc(shifts[note.phase].time) + '</small>';
    } else if (s.phase > 0) {
      result += '<p class="handover-quote">Kabir says Leela has the adapter and will return it at 9 am Saturday.</p>' +
        '<small>Film Society message · Friday 7:30 pm</small>';
    } else {
      result += '<p class="handover-quote">No staff handover note yet. Record who collected the kit before moving shifts.</p>';
    }
    result += '<div class="handover-link">' + btn("Open Desk book", "go-notes", "", "quiet-action") +
      '</div></section></div>';
    return result;
  }

  function requestPage() {
    let html = head(
      "What equipment was approved?",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Which units are available?",
      "Physical units · shelf location and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Which items still need to come back?",
      "Grouped by approved request · One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" + label + '</span><select name="' + key +
        '" required><option value="">Select…</option>' + opts(options) +
        "</select></label>";
      return html + '<form data-issue><div class="form">' +
        select("Approved request", "req", requests.map((r) => [r.id, r.id + " · " + r.club])) +
        select("Unit leaving the desk", "asset", available.map((a) => [a.id, a.id + " · " + a.type])) +
        select("Collected by", "who", people.map((p) => [p, p])) +
        select("Return by", "due", ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d])) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>';
    }
    html += '<div class="buttons">' + ["Outstanding", "All slips"].map((label, i) =>
      '<button type="button" data-action="scope" data-val="' + i +
      '" aria-pressed="' + (s.onlyOpen === (i === 0)) + '">' + label + "</button>"
    ).join("") + "</div>";

    // Group from ALL slips first. Filtering returned slips before counting
    // would incorrectly turn a partial return (2/3) into 0/1.
    const groups = new Map();
    for (const loan of s.loans) {
      if (!groups.has(loan.req)) groups.set(loan.req, []);
      groups.get(loan.req).push(loan);
    }
    const visible = [...groups.entries()]
      .filter(([, loans]) => !s.onlyOpen || loans.some((loan) => !loan.back))
      .sort((a, b) => Math.max(...b[1].map((l) => l.num)) - Math.max(...a[1].map((l) => l.num)));

    if (!visible.length) return html + "<p>No outstanding slips. Choose All slips to review completed requests.</p>";

    html += '<div class="loan-groups">';
    for (const [reqId, loans] of visible) {
      const request = getReq(reqId);
      const returned = loans.filter((loan) => loan.back).length;
      const total = loans.length;
      const remaining = total - returned;
      const missing = loans.filter((loan) => !loan.back).map((loan) => loan.asset);
      const state = remaining === 0 ? "Complete" : returned > 0 ? "Partially returned" : "On loan";
      html += '<section class="request-card' + (remaining === 0 ? ' is-complete' : '') +
        '" aria-label="Request ' + esc(reqId) + '">';
      html += '<div class="request-card-header"><div><small>' + esc(reqId) +
        ' · ' + esc(request ? request.club : "Unknown club") + '</small><h3>' +
        esc(request ? request.event : "Approved request") + '</h3><small>Due ' +
        esc(request ? request.due : "Not specified") + '</small></div>' +
        '<div class="return-progress" aria-label="' + returned + ' of ' + total +
        ' items returned"><strong>' + returned + '/' + total +
        '</strong><small>items returned</small></div></div>';
      html += '<p class="request-summary"><span class="tag' +
        (remaining === 0 ? ' good' : '') + '">' + state + '</span> ' +
        (remaining ? 'Still outstanding: <strong>' + esc(missing.join(', ')) + '</strong>' :
          '<strong>All issued items returned</strong>') + '</p>';
      html += '<ul class="loan-list">';
      for (const loan of loans) {
        const asset = getAsset(loan.asset);
        html += '<li data-loan-asset="' + esc(loan.asset) + '"><div class="loan-details"><strong>' +
          esc(loan.asset) + ' · ' + esc(asset ? asset.type : "Unknown item") +
          '</strong><small>Slip L-' + esc(loan.num) + ' · ' + esc(loan.who) +
          ' · Due ' + esc(loan.due) + '</small></div><div class="loan-actions">' +
          badge(loan.back ? "Returned" : "Outstanding", loan.back) +
          (loan.back ? "" : btn("Record return", "return", String(loan.num), "primary")) +
          '</div></li>';
      }
      html += '</ul></section>';
    }
    return html + '</div>';
  }

  function deskbook() {
    let html = head(
      "What must the next shift know?",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Overview: overview,
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "issue":
        s.tab = "Loan register";
        s.editing = true;
        break;
      case "show-loans":
        s.tab = "Loan register";
        s.editing = false;
        s.onlyOpen = true;
        break;
      case "show-all":
        s.tab = "Loan register";
        s.editing = false;
        s.onlyOpen = false;
        break;
      case "go-notes":
        s.tab = "Desk book";
        s.editing = false;
        break;
      case "go-request":
        s.tab = "Requests";
        s.selected = "RQ-214";
        s.editing = false;
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        l.back = true;
        s.notice = l.asset + " returned to stock. Slip L-" + l.num + " closed.";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
