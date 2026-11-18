# Campus Stores — Product Engineer work sample

This repository contains a working prototype for the [Virinchi Healthcare Campus Stores assignment](https://github.com/virinchi-healthcare/campus-stores). It preserves the original equipment-desk simulation and adds **a task-first shift dashboard** alongside **request-level tracking for partial returns**.

## Run it

Open `index.html` in a modern browser; no installation or network connection is required. Alternatively, from the repository directory:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit `http://localhost:8000`. Your actions are stored in this browser's localStorage. Use **Restart sample shift** to reset the fictional records.

## Candidate brief — product critique and prototype

### A moment the product handles well

At **Friday 3:45 pm**, the approved request **RQ-214 (Film Society)** specifies a USB-C-only playback laptop, a projector, a speaker, and a USB-C to HDMI adapter. The *Requests* view provides the context needed to issue a complete kit rather than just a projector. The *Inventory* view marks **PR-06** as *In repair*, and the issue form prevents lending it. These clear constraints help staff avoid an unusable setup.

I would **keep** the approved-request checks, per-physical-unit issue slips, inventory status, and Desk book for asynchronous handovers. They protect stock accuracy without forcing the next shift to reconstruct the story from memory.

### A moment I would change

At **Friday 7:30 pm**, Kabir brings back **PR-04** (projector) and **SP-02** (speaker), but **AD-12** (adapter) stays with Leela until Saturday morning. In the original flat Loan register, each slip is independent. A worker can close two slips but cannot immediately tell whether the **whole screening request** is complete or which item remains. That is a handover risk, not an inventory-data problem.

### Working prototype: an action-first overview and request-level return summary

The new **Overview** view answers **“What needs attention now?”** with a phase-sensitive, state-aware recommendation; three calculated metrics (kit issued, kit returned, other loans out); a short equipment-status list; and the latest handover. Each primary button opens the exact record needed for the next action. There are no decorative charts, invented sales metrics, or artificial alerts. Counts reflect the active browser's fictional sample-shift data, not live institutional data. All existing record tabs remain available.\n\nThe updated **Loan register** groups existing slips under the same approved request and displays:
- **0/3, 2/3, or 3/3 items returned**, calculated from *all* slips for that request, including returned ones.
- The **exact outstanding asset IDs**, prominently identified.
- Per-unit collector, due time, return state, and a **Record return** action on outstanding items.
- An **Outstanding** view of requests with any missing item and an **All slips** view that also shows completed requests.

A partially returned request remains visible in **Outstanding** with both returned and missing units, so **2/3** does not incorrectly become **0/1** after filtering. A completed request leaves Outstanding but remains accessible via All slips.

This is deliberately a workflow and presentation-layer change: it retains the original issue-slip model, validation, Desk book, browser storage, and fictional sample data. It uses restrained visual hierarchy, status text as well as color, responsive cards, and light/dark-theme-aware styling.

### Reproduce the same shift

1. **Friday 3:45 pm — pickup.** The *Overview* prioritizes the unfinished kit and offers **Create issue slip**. Open *Loan register* and create three issue slips under **RQ-214**, each collected by **Kabir Sen**, due **Fri 8 pm**: **PR-04**, **SP-02**, and **AD-12**. Confirm that RQ-214 now shows **0/3**. In the Desk book, note that Kabir collected the full kit.
2. **Friday 7:30 pm — partial return.** Click *Move to return time*. The *Overview* points to the outstanding return work. Record returns for **PR-04** and **SP-02**, leaving AD-12 untouched. The grouped card shows **2/3 items returned** and **Still outstanding: AD-12**. In the Desk book, note: *Kabir returned the projector and speaker; Leela Das will return adapter AD-12 at 9 am tomorrow.*
3. **Saturday 9:00 am — handover.** Click *Move to next morning*. The *Overview* identifies the remaining kit unit. Read the Desk book handover. In *Loan register*, record **AD-12**'s return. The RQ-214 card disappears from *Outstanding*; switch to **All slips** to see **3/3** and **Complete**. Add a closure note to the Desk book.

The existing **RQ-209** microphone loan is intentionally not changed.

### Validation at a real counter

I would **observe a campus media desk during real multi-item/partial returns** and record one concrete behavior: *How often must the attendant cross-reference multiple individual slips or ask a colleague to identify what remains outstanding for a request?* I would also time how long it takes to identify the correct outstanding unit before and after trying request-level grouping. A reduction in lookup time and cross-referencing would support the change; merely adding a progress counter is not proof of value.

### Scope and caveats

- This is an **offline, single-browser prototype**, not a multi-user production inventory service.
- The **X/Y counter means returned vs. issued slips**; it does not assert that every approved item was issued.
- The original record preserves the **collector at issue time**; the actual person returning equipment is recorded in the Desk book, not in the slip.
- Browser interactions (including shift notes) are **not embedded in a Git commit**. Reviewers can reproduce the full scenario using the steps above.

## Files

- `index.html` — original interface and candidate brief
- `app.js` — original simulation with live shift overview and request-level return summaries
- `styles.css` — original styles plus responsive, theme-aware grouped-card styles
- `third-party/lucide-LICENSE.txt` — retained original icon license

Original project: https://github.com/virinchi-healthcare/campus-stores

## Submit

For a code review, use the final **commit URL**, not just this repository URL. The assignment's instructions specify a public **fork**; this repository is a separately named repository rather than a GitHub fork. If the recruiting form enforces the fork requirement, the files should also be placed in an actual fork of the original project.

Do not add your roll number or email address to this public repository; enter them only in the official submission form.

## Dashboard rationale and checks

The default **Overview** deliberately uses one question, one dominant next step, and only three relevant numbers. A staff member can identify the missing equipment and open the correct task without scanning every slip. The interface uses size and position for priority, subdued neutrals for context, and a limited attention accent for outstanding status. Every colored state also has a text label. A 3-item equipment list is more precise than a chart for this small, task-based dataset.

The initial sample time is **Friday 3:45 pm**; it is not a real-time timestamp. Metrics are derived from the current browser's fictitious records. The exact state follows the user's actions rather than displaying fixed demonstration numbers.

To run the dependency-free interaction checks, use `node --test tests/dashboard.test.cjs` (Node.js 18+).
