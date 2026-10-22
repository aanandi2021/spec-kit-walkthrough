// The walkthrough content. One entry per Spec Kit step, in order.
// Text fields are Markdown. Prompt templates use {field} placeholders filled from the project form.
window.STEPS = [
  {
    id: "setup",
    title: "Set up",
    cmd: "specify init",
    phase: "Start",
    what: `Spec Kit is a set of slash commands for your coding agent, plus a few templates and scripts. It walks one idea at a time from *what and why* to working, tested code, writing a document at each step. Every later step reads the earlier ones, so the agent stays on track over a long build and you can see exactly why something was built the way it was.

Setting up adds two folders to a repo: \`.specify/\` (templates, scripts, and the constitution) and \`.github/skills/\` (the \`/speckit-*\` commands Copilot CLI picks up).`,
    youType: `uvx --from git+https://github.com/github/spec-kit.git specify init {slug} --integration copilot`,
    typeNote: "Run in the folder *above* where the repo should go. For an existing repo, `cd` into it and use `--here` instead of a name.",
    youGet: [".specify/", ".github/skills/speckit-*/"],
    here: `The repo was created as \`A:\\coding\\history\`, initialised with \`--integration copilot\`, and pushed private as **aanandi2021/history**. The first commit also held the three HTML mockups, which were exploration *before* any spec. That is a good order: sketch freely, then specify once you know what you like.`,
    commit: "5b4ae06",
    pitfalls: [
      "`uvx` comes with `uv`. If it's missing, `pip install uv` first.",
      "Restart Copilot CLI in the repo folder afterwards so it finds the new `/speckit-*` commands.",
      "On Windows the helper scripts are PowerShell (`.specify/scripts/powershell/`). They need `pwsh`."
    ],
    doneWhen: [
      "`.specify/` and `.github/skills/` exist in the repo",
      "Typing `/speckit` in Copilot CLI lists the commands",
      "The repo is committed and pushed (private is fine)"
    ]
  },
  {
    id: "constitution",
    title: "Constitution",
    cmd: "/speckit-constitution",
    phase: "Principles",
    what: `The constitution is the short list of rules the whole project lives by. Every plan is checked against it, so it is worth an hour of thought. Good principles are ones a plan could actually *fail*: "works offline from a double-click" can be checked; "high quality" can't.

You write it once per project, not per feature. It has a version number and a change log, and you amend it on purpose rather than drifting.`,
    youType: `/speckit-constitution {name}: {idea}. Principles: {values}. Constraints: {constraints}. Keep each principle short and testable, and say why it matters.`,
    youGet: [".specify/memory/constitution.md"],
    here: `Seven principles, each one something a plan can be checked against:

1. **The vault is the source of truth.** Notes first; the viewer reads, never writes.
2. **Accuracy is visible.** Approximate dates say "c."; the map says when borders are a rough picture.
3. **Canada and "meanwhile".** A Canada lane is always first, because that's the reader's way in.
4. **Plain language** for a curious non-specialist.
5. **Static, offline, zero-build.** Opens from \`file://\` with no server.
6. **Tested before it ships.** Each user story has a browser test.
7. **Personal data stays local.** Family birth years never enter the repo.

Principles III, V and VII each became a concrete test later. That is the sign of a useful constitution.`,
    file: ".specify/memory/constitution.md",
    commit: "8134b39",
    pitfalls: [
      "More than about eight principles and nobody, including the agent, keeps them in mind.",
      "Avoid principles that are really features (\"has a map\"). Those belong in a spec.",
      "Write *why* under each one. Six months on, the why is what lets you decide whether to bend it."
    ],
    doneWhen: [
      "Each principle could fail a plan (it is testable or checkable)",
      "Each has a one-line reason",
      "Version 1.0.0 and the date are filled in",
      "Committed on its own (`docs: ratify constitution v1.0.0`)"
    ]
  },
  {
    id: "specify",
    title: "Specify",
    cmd: "/speckit-specify",
    phase: "What & why",
    what: `The spec describes **what** you want and **why**, in the user's words, with no technology in it. It's built from user stories, each one a slice that could ship on its own, in priority order. Each story gets an "independent test": one concrete check that proves it works.

The command makes a numbered folder (\`specs/001-short-name/\`), writes \`spec.md\`, and checks its own work against a quality checklist. It may leave up to three \`[NEEDS CLARIFICATION]\` markers for things it can't reasonably guess.`,
    youType: `/speckit-specify {firstFeature}. It's for {who}. Must do: {mustHaves}. Not in this feature: {outOfScope}.`,
    typeNote: "Describe the experience, not the code. If you catch yourself naming a library, save that for the plan.",
    youGet: ["specs/NNN-name/spec.md", "specs/NNN-name/checklists/requirements.md"],
    here: `Feature **001-world-viewer**: five user stories, from "see a moment everywhere at once" (P1) down to "my family on the timeline" (P5), plus 16 functional requirements and 6 success criteria.

Story 1's independent test is concrete enough to automate word for word: *move the cursor to 19 August 1942 and confirm the panel lists Dieppe, Stalingrad and Guadalcanal, shows Churchill, Roosevelt, King and Stalin, and pins Dieppe on the map.* That sentence later became the first browser test.`,
    file: "specs/001-world-viewer/spec.md",
    commit: "9d29fea",
    pitfalls: [
      "Stories that can't ship alone (\"set up the database\") are tasks, not stories.",
      "Success criteria need numbers: \"in under 1.5 seconds\", \"100% of links\".",
      "Keep it about one feature. A second big idea is a second spec (002-…)."
    ],
    doneWhen: [
      "Every story has a priority and an independent test",
      "No technology names in the spec",
      "Success criteria are measurable",
      "The requirements checklist passes"
    ]
  },
  {
    id: "clarify",
    title: "Clarify",
    cmd: "/speckit-clarify",
    phase: "What & why",
    what: `Clarify reads the spec, finds the places where two reasonable people would build different things, and asks you up to five pointed questions, usually multiple choice with a recommended answer. Your answers are written back into the spec under **Clarifications**, so the decision lives next to the requirement.

It's optional, but it's the cheapest step in the whole process: a question now saves a rebuild later.`,
    youType: `/speckit-clarify`,
    typeNote: "Run it with no arguments. You can add a focus, for example `/speckit-clarify focus on what links should open`.",
    youGet: ["spec.md (Clarifications section added)"],
    here: `Five questions, answered in one session. Amit was away, so three answers were filled in as marked *defaults* for him to review:

- Which mockup ideas carry forward? → swimlanes from A, map from B.
- What should a link open? → Obsidian for notes, Wikipedia for background, Calibre or the Ottawa library for books. *(library: default)*
- What is a "set of big world events"? → a **chapter**: a date range with a map region; the most specific chapter wins. *(default)*
- How to show Russian territory without historical borders? → pins and chapter zooms only, with a note saying so. *(default)*
- Should a moment be shareable as a link? → yes, in the address bar. *(default)*

Marking defaults openly is a good habit when you delegate: the decision is made, and it's flagged for a second look.`,
    file: "specs/001-world-viewer/spec.md",
    anchor: "Clarifications",
    commit: "9d29fea",
    pitfalls: [
      "Don't skip it because the spec \"looks fine\". The gaps are invisible from the inside.",
      "If an answer changes the scope a lot, re-run specify instead of patching."
    ],
    doneWhen: [
      "No `[NEEDS CLARIFICATION]` markers left",
      "Each answer appears in the spec's Clarifications section",
      "Defaults you didn't choose yourself are marked as defaults"
    ]
  },
  {
    id: "plan",
    title: "Plan",
    cmd: "/speckit-plan",
    phase: "How",
    what: `Now the *how*. You name the technology and constraints; the plan works out the architecture and checks it against every principle in the constitution (the **Constitution Check** table). Alongside \`plan.md\` it writes:

- \`research.md\`: each technical decision, the alternatives, and why.
- \`data-model.md\`: the entities and their rules.
- \`contracts/\`: the exact shape of anything another part depends on (file formats, URLs, APIs).
- \`quickstart.md\`: how to run it and the manual checks.`,
    youType: `/speckit-plan Use {stack}. {constraints}.`,
    youGet: ["plan.md", "research.md", "data-model.md", "contracts/", "quickstart.md"],
    here: `Plain JavaScript with d3, no build step; data files that register themselves on \`window\` so the page works from a double-click; one pure \`model.js\` shared by the browser and the Node tests; Puppeteer for browser tests.

Two decisions worth reading in \`research.md\`: why data is loaded with \`<script>\` tags rather than \`fetch\` (browsers block \`fetch\` on \`file://\`), and how partial dates like "1582" are placed (mid-year, and marked approximate). The URL format got its own contract, which later made the "shareable moment" test easy to write.`,
    file: "specs/001-world-viewer/plan.md",
    commit: "4a9e8d2",
    pitfalls: [
      "If a Constitution Check row says FAIL, fix the plan or amend the constitution on purpose. Don't leave it.",
      "Contracts are worth it even for a one-person project: they're what the tests check against.",
      "Keep research.md honest about alternatives. It's how future-you avoids re-arguing a decision."
    ],
    doneWhen: [
      "Every principle has a PASS (or a justified exception) in the Constitution Check",
      "Each library or format choice has a reason in research.md",
      "Contracts exist for data formats and URLs",
      "quickstart.md says how to run it"
    ]
  },
  {
    id: "checklist",
    title: "Checklist",
    cmd: "/speckit-checklist",
    phase: "How",
    optional: true,
    what: `An optional extra. A checklist here is "unit tests for English": questions that test whether the *requirements* are complete and unambiguous on a theme you pick, such as accessibility, security or data quality. It doesn't test the code.`,
    youType: `/speckit-checklist {checklistFocus}`,
    youGet: ["specs/NNN-name/checklists/<theme>.md"],
    here: `Not run separately for this feature beyond the automatic requirements checklist from specify. A good candidate for the next feature would be a *data accuracy* checklist: does every dataset say where its dates come from, and how approximate they are?`,
    file: "specs/001-world-viewer/checklists/requirements.md",
    pitfalls: ["Use it for themes that cut across stories. One theme per checklist."],
    doneWhen: ["Each unchecked item is either fixed in the spec or knowingly accepted"]
  },
  {
    id: "tasks",
    title: "Tasks",
    cmd: "/speckit-tasks",
    phase: "Build",
    what: `Tasks turns the plan into a numbered, ordered list of small jobs, grouped by user story so each story can be built and tested on its own. \`[P]\` marks tasks that touch different files and can run in parallel. Each task names the file it touches.`,
    youType: `/speckit-tasks`,
    youGet: ["specs/NNN-name/tasks.md"],
    here: `Thirty tasks (T001–T030) plus one manual task for Amit (T040: click a real Obsidian link and a real Calibre link on his PC). Setup and the shared model came first; then one block per user story, each ending in its browser test; then polish.`,
    file: "specs/001-world-viewer/tasks.md",
    commit: "93e57b7",
    pitfalls: [
      "A task that takes more than an hour or two should be split.",
      "Every story block should end in a test task. If one doesn't, analyze will catch it.",
      "Manual checks that only you can do deserve their own task number."
    ],
    doneWhen: [
      "Every requirement maps to at least one task",
      "Every story ends with a test task",
      "Tasks name their files"
    ]
  },
  {
    id: "analyze",
    title: "Analyze",
    cmd: "/speckit-analyze",
    phase: "Build",
    what: `A read-only cross-check of spec, plan and tasks before any code is written. It reports coverage gaps (a requirement with no task), inconsistencies, ambiguities and duplicates, each with a severity. It changes nothing itself; you decide what to fix.`,
    youType: `/speckit-analyze`,
    youGet: ["A findings report (saved here as analysis.md)"],
    here: `Seven findings. Two were real gaps, and fixing them before coding was cheap:

- **C1 (HIGH):** the spec said approximate dates must be marked, but no task did it. Added to the panel and card tasks.
- **C2 (MEDIUM):** "works offline" was claimed but never tested. The browser tests now block every network request.

One finding (U1, chapters crossing the 180° line) was first marked as solved, then corrected to *deferred* once the code showed otherwise. Analysis documents should be kept honest too.`,
    file: "specs/001-world-viewer/analysis.md",
    commit: "93e57b7",
    pitfalls: [
      "Fix HIGH findings before implementing. LOW ones can wait.",
      "It doesn't save a file by default. Ask for one, or paste the report into analysis.md."
    ],
    doneWhen: ["No HIGH or CRITICAL findings open", "Each finding has a decision next to it"]
  },
  {
    id: "implement",
    title: "Implement",
    cmd: "/speckit-implement",
    phase: "Build",
    what: `The agent works through tasks.md in order, ticking each off. For a long build, ask it to run the tests after each story and to commit at the end of each story, so a bad turn is easy to roll back.

This is where the earlier steps pay for themselves: the agent has the spec, plan, contracts and tasks to check itself against, rather than your memory of a conversation.`,
    youType: `/speckit-implement Run the tests after each user story, and commit when each story passes.`,
    youGet: ["The code", "Tests", "tasks.md with [x] ticks"],
    here: `The viewer (\`app/\`) and 40 tests (\`npm test\`): data validation, unit tests for the date and link logic, and one Puppeteer test per user story, all with the network blocked.

The tests earned their keep on the first run. They caught four real bugs before Amit saw the app:

1. Chapters that didn't fit were drawn **on top of each other**, so "Barbarossa to Stalingrad" couldn't be clicked. A test now checks that no two bars overlap.
2. A link with no date (\`#russia\`) opened at 1450 rather than where the story starts.
3. Zooming to a chapter left the date cursor stranded outside it.
4. Map labels piled on top of one another over Europe.`,
    file: "README.md",
    commit: "44625da",
    pitfalls: [
      "Don't let it skip ahead of failing tests.",
      "When the code and a spec document disagree, fix one of them right away. Here the URL contract was updated when the fallback date changed.",
      "Screenshots in the test run are the quickest review: look at them."
    ],
    doneWhen: [
      "All tasks ticked except manual ones",
      "`npm test` (or equivalent) passes",
      "README says how to run it",
      "Pushed"
    ]
  },
  {
    id: "converge",
    title: "Converge & next",
    cmd: "/speckit-converge",
    phase: "After",
    what: `After a build, \`/speckit-converge\` compares the code with the spec, plan and tasks and adds any unbuilt work to tasks.md so a further \`/speckit-implement\` can finish it. \`/speckit-taskstoissues\` turns open tasks into GitHub issues if you'd rather track them there.

The next idea starts again at **Specify** with a new number (002-…). The constitution carries over.`,
    youType: `/speckit-converge`,
    youGet: ["tasks.md (new tasks appended)", "GitHub issues (optional)"],
    here: `Next candidates for Amit's World, each its own spec: **002** a third period (perhaps the Bengal–Java–China trade world behind the novel idea), **003** reading the timeline straight from the vault notes' frontmatter, **004** historical borders for Russia.`,
    pitfalls: ["Resist adding \"just one more thing\" to a finished spec. Start the next one."],
    doneWhen: ["Converge finds nothing left, or the leftovers are tasks", "The next feature has a name"]
  }
];

// Ready-made starting points for the project form.
window.PRESETS = {
  blank: { name: "", idea: "", who: "", values: "", constraints: "", firstFeature: "", mustHaves: "", outOfScope: "", stack: "", checklistFocus: "" },
  "neon-rain": { name: "Neon Rain" },
  "dead-heat": { name: "Dead Heat" }
};
window.EXAMPLE_PROJECT = {
  name: "Amit's World",
  idea: "a visual companion to Amit's Notes of the History of the World: timelines and maps linked to the Obsidian notes",
  who: "Amit, a curious Canadian reader with a thin European history background",
  values: "the vault is the source of truth; accuracy is visible; Canada always first; plain language; static and offline; tested before it ships; family data stays local",
  constraints: "opens from a double-click with no server or build; works offline",
  firstFeature: "A world viewer that combines a map with swimlanes, so I can see what was happening everywhere at one moment",
  mustHaves: "chapters that zoom the map and timeline together; links to vault notes, Wikipedia and my books; shareable links to a moment; WW2 and Russia datasets",
  outOfScope: "historical borders for Russia; editing the notes from the viewer",
  stack: "plain JavaScript and d3 with no build step, data as script files, Puppeteer for browser tests",
  checklistFocus: "data accuracy"
};
