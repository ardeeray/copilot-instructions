# copilot-instructions

Global Copilot instruction files for VS Code. Loaded as always-on context in every conversation, across every workspace. Stack-level rules live here; project-specific rules stay in each repo's `.github/instructions/`.

**Two-layer architecture:**
- `~/copilot-instructions/files/` — global stack rules (this repo, machine-local)
- `.github/instructions/` in each repo — project-specific overrides (version-controlled per repo)

---

## What's in `files/`

### `documentation.instructions.md`
Generic rules for writing and maintaining documentation in any project.
- Key concepts section requirement — format block + when to apply
- Doc-worthiness criteria — what triggers an update, what doesn't
- Manual fallback section requirement
- Script standards — dry-run mode, env-var placeholders, IAM role header, rollback steps, output snippet
- Always-on (no `applyTo` filter); project files override the store URL and "what to ask" prompt

### `decision-capture.instructions.md`
Universal workflow for recording architectural decisions.
- Detects decision signals mid-task (library choices, deletions, "I don't want to use X")
- Runs a structured interview — alternatives, rejection reasons, risks, revisit conditions
- Proposes a `DEC-NNN` decision entry and/or changelog entry at end of task
- Saves to `files/decisions.md` + `files/changelog.md` by default; project files override the paths
- Includes per-language linkback comment formats and lookup instructions

### `error-capture.instructions.md`
Universal workflow for documenting errors and their fixes.
- Triggered only when explicitly asked — never runs automatically
- Saves to `files/errors.md` by default; project files override the path
- Entry format: H3 title / Quick fix / Full error (exact output) / Fix steps
- Dedup rule — checks for existing entries before adding

### `nextjs-firebase.instructions.md`
Coding conventions for any Next.js 15 + Firebase + MUI v7 project.
- TypeScript strictness — no `any`, typed API responses, `unknown` in catch blocks
- Next.js 15 App Router patterns — `params` as a Promise, Server vs. client boundary, route handlers
- Firebase Auth session cookie pattern; Firestore Admin SDK server helper pattern
- MUI v7 layout — CSS Grid via `Box`, `Stack`, no deprecated `<Grid item>`; no mixing MUI + Tailwind on the same element
- ESLint/JSX entity guidelines

### `flutter-firebase.instructions.md`
Coding conventions for any Flutter + Firebase + Riverpod project.
- Riverpod 3.x patterns and breaking changes; code generation (`@riverpod`, build_runner)
- Widget choice — `ConsumerWidget` vs `HookConsumerWidget`
- Logging conventions, async/error handling, `context.mounted` guard
- Immutable state classes, image error handling, Dumb Widget Pattern

---

## Setup on a new machine

1. Clone this repo to your home directory:
   ```bash
   git clone <repo-url> ~/copilot-instructions
   ```

2. Run the setup script to wire the files into VS Code `settings.json`:
   ```bash
   node ~/copilot-instructions/setup.mjs
   ```

3. Restart VS Code (or reload the window) for the instructions to take effect.

**Adding a new instructions file?** Drop a `*.instructions.md` file in `files/` and re-run `setup.mjs`. The script auto-discovers all files — no manual edits needed.

---

## Project override files

The global files cover stack-level rules. For project-specific details (schema, routes, cookie names, theme tokens, log file paths), add override files inside the project repo — they are version-controlled there and shared with collaborators.

**1. Create the file** in the project repo at `.github/instructions/<name>.instructions.md`.

**2. Set `applyTo`** in the YAML frontmatter to control when Copilot loads it:

```markdown
---
applyTo: '**'
---
```

Common patterns:

| `applyTo` value | When it's loaded |
|---|---|
| `'**'` | Every file in the project (always-on) |
| `'**/*.tsx'` | Only when editing `.tsx` files |
| `'{src/lib/firebase/**,src/middleware.ts}'` | Only when editing those paths |

**3. Write only the project-specific parts.** Add a pointer to the global file at the top so the relationship is clear, then add only what overrides or extends it:

```markdown
---
applyTo: '**'
---

# Documentation — my-project

> Generic doc conventions are in `~/copilot-instructions/files/documentation.instructions.md`.
> This file adds only project-specific overrides.

## What to ask

At the end of any doc-worthy task, ask:
> Should I also update the docs at `/admin/docs`?

## Doc store

| Change type | Store |
|---|---|
| Architecture, schema | Repo `docs/<category>/<slug>.md` |
| Runbooks, one-off ops notes | Firestore `adminDocs` |
```

**4. No wiring needed.** VS Code picks up `.github/instructions/*.instructions.md` automatically in any workspace that contains the repo — no `settings.json` changes required.

---

### Manual alternative

If you prefer to wire manually, add this to your VS Code `settings.json`:

```json
"github.copilot.chat.codeGeneration.instructions": [
  { "file": "/Users/<you>/copilot-instructions/files/decision-capture.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/files/documentation.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/files/error-capture.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/files/flutter-firebase.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/files/nextjs-firebase.instructions.md" }
]
```

Replace `/Users/<you>` with your actual home directory (`echo $HOME`).

---

## Changelog

### 2026-05-03
- Added `documentation.instructions.md` — extracts generic doc conventions (Key concepts, doc-worthy triggers, script standards) from ardeeportal's `docs.instructions.md`; project file slimmed to overrides only + `applyTo: '**'` so checks fire on any file
- Added Tailwind/MUI mixing rule to `nextjs-firebase.instructions.md`; removed redundant per-form duplicate
- Reorganized repo: moved all content files into `files/` subfolder; `README.md` and `setup.mjs` remain at root
- `setup.mjs` now prunes stale settings.json entries and handles VS Code's JSONC format (comments + trailing commas)
- Added `error-capture.instructions.md` + `files/errors.md` global errors log
- `decision-capture.instructions.md` made fully standalone: Defaults table, concrete entry format, per-language linkback rules, lookup instructions; created `files/decisions.md` + `files/changelog.md`
- `setup.mjs` made dynamic: auto-discovers all `*.instructions.md` in `files/`

### 2026-05-01 (initial commit)
- Created repo with `nextjs-firebase.instructions.md` and `flutter-firebase.instructions.md`
- Added `setup.mjs` to auto-wire files into VS Code `settings.json`
