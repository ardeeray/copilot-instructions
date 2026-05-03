#!/usr/bin/env node
/**
 * Purpose: Wire ~/copilot-instructions stack files into VS Code settings.json.
 * Run once after cloning this repo on a new machine.
 * Safe to re-run — it updates existing entries rather than duplicating them.
 *
 * Usage: node setup.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import os from 'os';

const home = os.homedir();
const platform = process.platform;

// Resolve VS Code settings.json path per platform
function getSettingsPath() {
  if (platform === 'darwin') {
    return join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  } else if (platform === 'win32') {
    return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Code', 'User', 'settings.json');
  } else {
    // Linux / WSL
    return join(home, '.config', 'Code', 'User', 'settings.json');
  }
}

const settingsPath = getSettingsPath();

if (!existsSync(settingsPath)) {
  console.error(`VS Code settings.json not found at: ${settingsPath}`);
  console.error('Make sure VS Code is installed and has been opened at least once.');
  process.exit(1);
}

const instructionsDir = join(home, 'copilot-instructions');

// Auto-discover all *.instructions.md files — no manual update needed when adding new files
const newEntries = readdirSync(instructionsDir)
  .filter((f) => f.endsWith('.instructions.md'))
  .sort()
  .map((f) => ({ file: join(instructionsDir, f) }));

// Parse settings.json — VS Code uses JSONC (comments + trailing commas allowed)
let raw = readFileSync(settingsPath, 'utf8');

function stripJsonc(src) {
  // Remove single-line // comments (not inside strings)
  // Remove multi-line /* */ comments
  // Remove trailing commas before } or ]
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n"]*/g, '')
    .replace(/,\s*([}\]])/g, '$1');
}

let settings;
try {
  settings = JSON.parse(stripJsonc(raw));
} catch (err) {
  console.error('Could not parse settings.json:', err.message);
  console.error('Path:', settingsPath);
  process.exit(1);
}

const key = 'github.copilot.chat.codeGeneration.instructions';
const existing = settings[key] ?? [];

// Resolve ${userHome} placeholders so we can deduplicate across both formats
function resolveFile(f) {
  return f?.replace(/\$\{userHome\}/g, home).replace(/\\/g, '/');
}

// Remove legacy entries that used ${userHome} — replace with absolute paths
const cleaned = existing.filter((e) => !e.file?.includes('${userHome}'));
const removedCount = existing.length - cleaned.length;
if (removedCount > 0) {
  console.log(`- Removed ${removedCount} legacy \${userHome} entries (replacing with absolute paths)`);
}

// Build a set of resolved files already registered
const resolvedFiles = new Set(cleaned.map((e) => resolveFile(e.file)));

let added = 0;
for (const entry of newEntries) {
  const resolved = resolveFile(entry.file);
  if (!resolvedFiles.has(resolved)) {
    cleaned.push({ file: entry.file });
    added++;
    console.log(`+ Added: ${entry.file}`);
  } else {
    console.log(`= Already present: ${entry.file}`);
  }
}

if (added > 0 || removedCount > 0) {
  settings[key] = cleaned;
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  console.log(`\nUpdated: ${settingsPath}`);
} else {
  console.log('\nNothing to do — all entries already present.');
}
