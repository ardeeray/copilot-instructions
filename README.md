# copilot-instructions

Global Copilot instruction files for VS Code. Loaded as always-on context in every conversation, across every workspace. Stack-level rules live here; project-specific rules stay in each repo's `.github/instructions/`.

---

## What's in `files/`

### `nextjs-firebase.instructions.md`
Coding conventions for any **Next.js 15 + Firebase + MUI v7** project. Covers: TypeScript strictness (no `any`, typed API responses), Next.js 15 App Router patterns (`params` as a Promise, Server vs. client boundary, route handlers), Firebase Auth session cookie pattern, Firestore Admin SDK rules, MUI v7 theming, and ESLint/JSX entity guidelines. Project-specific rules (schema, routes, theme tokens) stay in the repo's own `.github/instructions/`.

### `flutter-firebase.instructions.md`
Coding conventions for any **Flutter + Firebase + Riverpod** project. Covers: Riverpod 3.x patterns and breaking changes, code generation (`@riverpod`, build_runner), widget choice (`ConsumerWidget` vs `HookConsumerWidget`), logging conventions, async/error handling, `context.mounted` guard, immutable state classes, image error handling, and the Dumb Widget Pattern. Project-specific rules (Firestore schema, screen structure) stay in the repo's own `.github/instructions/`.

### `decision-capture.instructions.md`
Universal workflow for **recording architectural decisions**. Detects decision signals mid-task (library choices, deletions, "I don't want to use X"), runs a structured interview (alternatives, rejection reasons, risks, revisit conditions), then proposes a `DEC-NNN` decision entry and/or changelog entry at the end of the task. Saves to `files/decisions.md` and `files/changelog.md` by default; project-specific files override the paths. Includes per-language linkback comment formats and lookup instructions.

### `error-capture.instructions.md`
Universal workflow for **documenting errors and their fixes**. Triggered only when explicitly asked. Saves to `files/errors.md` by default; project-specific files override the path. Entry format: H3 title / Quick fix / Full error (exact output) / Fix steps. Includes a dedup rule (checks for existing entries before adding) and lookup instructions.

---

## Changelog

### 2026-05-03
- Reorganized repo: moved all content files into `files/` subfolder; `README.md` and `setup.mjs` remain at root
- `setup.mjs` now prunes stale settings.json entries (files that no longer exist on disk) on every run
- Added `error-capture.instructions.md` + `files/errors.md` global errors log
- `decision-capture.instructions.md` made fully standalone: added Defaults table, concrete entry format, per-language linkback rules, and lookup instructions; created `files/decisions.md` + `files/changelog.md` global log files
- `setup.mjs` made dynamic: auto-discovers all `*.instructions.md` in `files/` — no manual update needed when adding new files
- `setup.mjs` updated to handle VS Code's JSONC format (comments + trailing commas) and clean up legacy `${userHome}` entries

### 2026-05-01 (initial commit)
- Created repo with `nextjs-firebase.instructions.md` and `flutter-firebase.instructions.md`
- Added `setup.mjs` to auto-wire files into VS Code `settings.json`

---

## Files

| File | Applies to |
|---|---|
| `files/nextjs-firebase.instructions.md` | Any Next.js 15 + Firebase + MUI v7 project |
| `files/flutter-firebase.instructions.md` | Any Flutter + Firebase + Riverpod project |
| `files/decision-capture.instructions.md` | Any project — decision interview process and entry fields |
| `files/error-capture.instructions.md` | Any project — error documentation workflow |

**Adding a new instructions file?** Drop a `*.instructions.md` file in `files/` and re-run `setup.mjs`. The script auto-discovers all `*.instructions.md` files — no manual update to the script or this table is needed.

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

### Manual alternative

If you prefer to wire manually, add this to your VS Code `settings.json`:

```json
"github.copilot.chat.codeGeneration.instructions": [
  { "file": "/Users/<you>/copilot-instructions/decision-capture.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/flutter-firebase.instructions.md" },
  { "file": "/Users/<you>/copilot-instructions/nextjs-firebase.instructions.md" }
]
```

Replace `/Users/<you>` with your actual home directory (`echo $HOME`).

## How it works

VS Code Copilot loads these files as always-on context for all code generation in any workspace. They contain stack-level rules (TypeScript patterns, Riverpod conventions, Firebase Auth patterns, etc.) that complement the per-repo `.github/instructions/` files checked into each project.

**Two-layer architecture:**
- `~/copilot-instructions/` — global stack rules (this repo, machine-local)
- `.github/instructions/` in each repo — project-specific rules (version-controlled per repo)
