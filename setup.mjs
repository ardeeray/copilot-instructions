#!/usr/bin/env node
/**
 * Purpose: Wire ~/copilot-instructions stack files into VS Code settings.json.
 * Run once after cloning this repo on a new machine.
 * Safe to re-run — it updates existing entries rather than duplicating them.
 *
 * Usage: node setup.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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

const newEntries = [
  { file: join(instructionsDir, 'nextjs-firebase.instructions.md') },
  { file: join(instructionsDir, 'flutter-firebase.instructions.md') },
];

// Parse settings.json (handles trailing commas and comments via a forgiving parse)
let raw = readFileSync(settingsPath, 'utf8');

let settings;
try {
  settings = JSON.parse(raw);
} catch {
  console.error('Could not parse settings.json as strict JSON.');
  console.error('If you have comments or trailing commas, remove them temporarily, then re-run.');
  process.exit(1);
}

const key = 'github.copilot.chat.codeGeneration.instructions';
const existing = settings[key] ?? [];

// Build a set of files already registered (normalize slashes)
const existingFiles = new Set(existing.map((e) => e.file?.replace(/\\/g, '/')));

let added = 0;
for (const entry of newEntries) {
  const normalized = entry.file.replace(/\\/g, '/');
  if (!existingFiles.has(normalized)) {
    existing.push({ file: entry.file });
    added++;
    console.log(`+ Added: ${entry.file}`);
  } else {
    console.log(`= Already present: ${entry.file}`);
  }
}

if (added > 0) {
  settings[key] = existing;
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  console.log(`\nUpdated: ${settingsPath}`);
} else {
  console.log('\nNothing to do — all entries already present.');
}
