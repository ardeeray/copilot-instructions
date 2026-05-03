# copilot-instructions

Global stack-level Copilot instruction files for VS Code. These contain reusable rules that apply to any project using these technology stacks — keeping them separate from individual repos lets them be shared across machines and future projects.

## Files

| File | Applies to |
|---|---|
| `nextjs-firebase.instructions.md` | Any Next.js 15 + Firebase + MUI v7 project |
| `flutter-firebase.instructions.md` | Any Flutter + Firebase + Riverpod project |
| `decision-capture.instructions.md` | Any project — decision interview process and entry field definitions |

**Adding a new instructions file?** Drop a `*.instructions.md` file in this directory and re-run `setup.mjs`. The script auto-discovers all `*.instructions.md` files — no manual update to the script or this table is needed.

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
