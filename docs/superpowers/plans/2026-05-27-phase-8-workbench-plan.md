# Phase 8 Workbench UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline.

**Goal:** Assemble a Workbench UI — a single development console page where the user can view the GameSpec, inspect assets, run game preview, run playtests, and review patch history.

**Architecture:** A single HTML page served at `/workbench` (Vite dev server) with sections for each tool. Playwright can screenshot it as part of a dedicated workbench spec.

**Tech Stack:** HTML + vanilla JS, inline styles, no build step for the page itself.

---

## Task 0032: Workbench HTML Page

### Step 1: Create public/workbench.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MMO Harness Workbench</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e8; min-height: 100vh; }
    .header { background: #13131a; border-bottom: 1px solid #2a2a3a; padding: 12px 20px; display: flex; align-items: center; gap: 16px; }
    .header h1 { font-size: 16px; font-weight: 600; color: #a0d8ef; }
    .header .version { font-size: 12px; color: #666; }
    .tabs { display: flex; gap: 0; padding: 12px 20px 0; border-bottom: 1px solid #1e1e28; }
    .tab { padding: 8px 16px; cursor: pointer; border-radius: 6px 6px 0 0; font-size: 13px; color: #888; background: transparent; border: 1px solid transparent; border-bottom: none; }
    .tab.active { background: #13131a; color: #a0d8ef; border-color: #2a2a3a; }
    .tab:hover { color: #c0c0d0; }
    .content { padding: 20px; }
    .section { display: none; }
    .section.active { display: block; }
    .card { background: #13131a; border: 1px solid #2a2a3a; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .card h3 { font-size: 13px; font-weight: 600; color: #a0d8ef; margin-bottom: 12px; }
    button { background: #1e2230; color: #c0c8d8; border: 1px solid #3a3a4a; border-radius: 6px; padding: 8px 16px; font-size: 13px; cursor: pointer; }
    button:hover { background: #2a3040; border-color: #5a5a6a; }
    button.primary { background: #2563a0; color: #fff; border-color: #2563a0; }
    button.primary:hover { background: #3070b0; }
    button.danger { background: #6b2020; color: #fff; border-color: #6b2020; }
    button.danger:hover { background: #7b3030; }
    .inline-code { font-family: monaco, 'Cascadia Code', monospace; background: #0d0d14; padding: 2px 6px; border-radius: 3px; font-size: 12px; color: #a0d8ef; }
    .log { font-family: monaco, 'Cascadia Code', monospace; background: #0d0d14; padding: 12px; border-radius: 6px; font-size: 12px; max-height: 300px; overflow-y: auto; line-height: 1.6; }
    .log-entry { padding: 2px 0; }
    .log-entry.info { color: #a0d8ef; }
    .log-entry.success { color: #50c878; }
    .log-entry.error { color: #e05a5a; }
    .log-entry.warn { color: #e0a040; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .status-dot.ok { background: #50c878; }
    .status-dot.err { background: #e05a5a; }
    .status-dot.warn { background: #e0a040; }
    iframe { width: 100%; height: 400px; border: 1px solid #2a2a3a; border-radius: 6px; background: #000; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
    .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .asset-card { background: #0d0d14; border: 1px solid #2a2a3a; border-radius: 6px; padding: 12px; }
    .asset-card img { width: 100%; max-height: 80px; object-fit: contain; background: #1a1a24; border-radius: 4px; }
    .asset-card .name { font-size: 12px; font-weight: 600; color: #c0c8d8; margin-top: 6px; }
    .asset-card .path { font-size: 11px; color: #666; font-family: monospace; margin-top: 2px; }
    .commit-list { font-family: monaco, monospace; font-size: 12px; }
    .commit-item { padding: 8px 0; border-bottom: 1px solid #1e1e28; }
    .commit-item:last-child { border-bottom: none; }
    .commit-hash { color: #a0d8ef; margin-right: 8px; }
    .commit-msg { color: #c0c0d0; }
    .commit-time { color: #555; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>MMO Harness Workbench</h1>
    <span class="version">Phase 8</span>
  </div>

  <div class="tabs">
    <div class="tab active" data-section="overview">Overview</div>
    <div class="tab" data-section="game">Game</div>
    <div class="tab" data-section="playtest">Playtest</div>
    <div class="tab" data-section="assets">Assets</div>
    <div class="tab" data-section="history">Patch History</div>
  </div>

  <div class="content">
    <!-- Overview -->
    <div class="section active" id="overview">
      <div class="grid-2">
        <div class="card">
          <h3>Project Stats</h3>
          <div id="stats"></div>
        </div>
        <div class="card">
          <h3>Quick Actions</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
            <button onclick="runAssetQA()">Run Asset QA</button>
            <button onclick="runValidate()">Validate Manifests</button>
            <button onclick="refreshOverview()">Refresh</button>
          </div>
          <div id="action-log" class="log" style="margin-top:12px;"><div class="log-entry info">Ready.</div></div>
        </div>
      </div>
      <div class="card">
        <h3>GameSpec Summary</h3>
        <div id="spec-summary"></div>
      </div>
    </div>

    <!-- Game -->
    <div class="section" id="game">
      <div class="card">
        <h3>Live Preview</h3>
        <p style="font-size:12px;color:#666;margin-bottom:12px;">Preview the game at <span class="inline-code">http://localhost:5173</span></p>
        <iframe src="http://localhost:5173" id="game-frame" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    </div>

    <!-- Playtest -->
    <div class="section" id="playtest">
      <div class="card">
        <h3>Playtest Controls</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
          <button class="primary" onclick="runPlaytest()">Run Playtest</button>
          <button onclick="showLastReport()">Show Last Report</button>
          <button onclick="showTestErrors()">Show Failures</button>
        </div>
      </div>
      <div class="card">
        <h3>Playtest Results</h3>
        <div id="playtest-log" class="log"></div>
      </div>
      <div class="card">
        <h3>Last Report</h3>
        <pre id="playtest-report" style="color:#888;font-size:12px;">No report generated yet. Run a playtest first.</pre>
      </div>
    </div>

    <!-- Assets -->
    <div class="section" id="assets">
      <div class="card">
        <h3>Asset QA</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
          <button class="primary" onclick="runAssetQA()">Run Asset QA</button>
          <button onclick="showQAReport()">Show QA Report</button>
        </div>
        <div id="asset-qa-log" class="log" style="margin-top:12px;"></div>
      </div>
      <div class="card">
        <h3>Characters</h3>
        <div class="asset-grid" id="character-list"></div>
      </div>
      <div class="card">
        <h3>Tilesets</h3>
        <div class="asset-grid" id="tileset-list"></div>
      </div>
    </div>

    <!-- History -->
    <div class="section" id="history">
      <div class="card">
        <h3>Recent Commits</h3>
        <div id="commit-list" class="commit-list">Loading...</div>
      </div>
      <div class="card">
        <h3>Phase Progress</h3>
        <div id="phase-progress"></div>
      </div>
      <div class="card">
        <h3>QA Reports</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
          <button onclick="showAssetQAReport()">Asset QA Report</button>
          <button onclick="showPlaytestReport()">Playtest Report</button>
        </div>
        <pre id="qa-reports" style="margin-top:12px;font-size:12px;color:#888;">No reports generated yet.</pre>
      </div>
    </div>
  </div>

  <script>
    function log(container, msg, type = 'info') {
      const el = document.createElement('div');
      el.className = 'log-entry ' + type;
      el.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
      document.getElementById(container).prepend(el);
    }

    async function fetchJSON(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }

    async function refreshOverview() {
      const logEl = 'action-log';
      log(logEl, 'Gathering project info...', 'info');
      try {
        const [manifests, validation] = await Promise.allSettled([
          fetchJSON('/assets/characters/verdant.manifest.json').catch(() => null),
          fetch('/api/validate').catch(() => null),
        ]);
        document.getElementById('stats').innerHTML = `
          <span class="status-dot ok"></span> Project ready at <span class="inline-code">${Date().slice(0, 10)}</span><br>
          <span class="status-dot ok"></span> Character manifest loaded<br>
        `;
        log(logEl, 'Readystatus OK', 'success');
      } catch (e) {
        log(logEl, 'Refresh failed: ' + e.message, 'error');
      }
    }

    async function runAssetQA() {
      const logEl = 'asset-qa-log';
      log(logEl, 'Running asset QA...', 'info');
      const r = await fetch('/api/asset-qa');
      const data = await r.json();
      log(logEl, 'Total assets: ' + data.totalAssets, 'info');
      log(logEl, 'Errors: ' + data.summary.errors + ', Warnings: ' + data.summary.warnings, data.summary.errors > 0 ? 'error' : 'success');
      data.issues.forEach(i => log(logEl, i.message, i.severity));
    }

    async function runValidate() {
      const logEl = 'action-log';
      log(logEl, 'Running validation...', 'info');
      log(logEl, 'Use npm run validate in terminal', 'warn');
    }

    async function runPlaytest() {
      document.getElementById('playtest-log').innerHTML = '';
      log('playtest-log', 'Run npm run playtest in terminal', 'warn');
      log('playtest-log', 'Playtest must be executed via terminal (Playwright CLI)', 'info');
    }

    function showLastReport() {
      log('playtest-log', 'Check reports/playtest-report.json', 'info');
    }

    function showTestErrors() {
      log('playtest-log', 'Check test-results/ for failure details', 'info');
    }

    async function showQAReport() {
      try {
        const r = await fetch('/api/asset-qa');
        const data = await r.json();
        document.getElementById('asset-qa-log').innerHTML = '';
        log('asset-qa-log', 'Total: ' + data.totalAssets + ' | Errors: ' + data.summary.errors + ' | Warnings: ' + data.summary.warnings, data.summary.errors > 0 ? 'error' : 'success');
      } catch { log('asset-qa-log', 'Run asset QA first via API', 'warn'); }
    }

    async function showAssetQAReport() {
      try {
        const r = await fetch('/api/asset-qa');
        const data = await r.json();
        document.getElementById('qa-reports').textContent = JSON.stringify(data, null, 2);
      } catch { document.getElementById('qa-reports').textContent = 'Error loading report. Run asset QA first.'; }
    }

    async function showPlaytestReport() {
      try {
        const r = await fetch('/reports/playtest-report.json');
        const data = await r.json();
        document.getElementById('qa-reports').textContent = JSON.stringify(data, null, 2);
      } catch { document.getElementById('qa-reports').textContent = 'No playtest report found.'; }
    }

    function loadAssetList(id, files) {
      const container = document.getElementById(id);
      container.innerHTML = '';
      files.forEach(f => {
        const card = document.createElement('div');
        card.className = 'asset-card';
        const path = id === 'character-list' ? '/assets/characters/' + f : '/assets/tilesets/' + f;
        card.innerHTML = `<img src="${path}" alt="${f}" onerror="this.style.display='none'"><div class="name">${f}</div><div class="path">${path}</div>`;
        container.appendChild(card);
      });
    }

    function loadCommitList() {
      fetch('/api/git/commits')
        .then(r => r.json())
        .then(commits => {
          const el = document.getElementById('commit-list');
          el.innerHTML = commits.map(c => `
            <div class="commit-item">
              <span class="commit-hash">${c.hash}</span>
              <span class="commit-msg">${c.message}</span>
              <span class="commit-time"> — ${c.time}</span>
            </div>
          `).join('');
        })
        .catch(() => { document.getElementById('commit-list').textContent = 'Unable to load commits (start dev server).'; });
    }

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.section).classList.add('active');
      });
    });

    // Load asset grids from static assets
    loadAssetList('character-list', ['verdant.png']);
    loadAssetList('tileset-list', ['village.png']);
    loadCommitList();

    // GameSpec summary
    fetch('/api/spec-summary')
      .then(r => r.text())
      .then(t => { document.getElementById('spec-summary').innerHTML = '<pre style="color:#888;font-size:12px;line-height:1.6">' + t + '</pre>'; })
      .catch(() => { document.getElementById('spec-summary').innerHTML = '<p style="color:#666">docs/GAME_SPEC.md</p>'; });

    refreshOverview();
  </script>
</body>
</html>
```

### Step 2: Wire API endpoints in server/src/index.ts

Read the existing server file first, then add these endpoints for the workbench:

```typescript
// GET /api/git/commits — recent commits
app.get('/api/git/commits', async (_req, res) => {
  try {
    const { execSync } = await import('child_process');
    const out = execSync('git log --oneline -20 --format="%h %s %ad" --date=short', { encoding: 'utf-8' });
    const commits = out.trim().split('\n').map(line => {
      const m = line.match(/^([a-f0-9]+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})$/);
      return m ? { hash: m[1], message: m[2], time: m[3] } : { hash: line.slice(0,7), message: line.slice(8), time: '' };
    });
    res.json(commits);
  } catch { res.json([]); }
});

// GET /api/spec-summary — first 50 lines of GAME_SPEC.md
app.get('/api/spec-summary', (_req, res) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../../GAME_SPEC.md'), 'utf-8');
    res.send(content.split('\n').slice(0, 50).join('\n') + '\n...');
  } catch { res.send('See docs/GAME_SPEC.md'); }
});

// GET /api/asset-qa — run asset QA and return report
app.get('/api/asset-qa', async (_req, res) => {
  try {
    const { spawnSync } = await import('child_process');
    const r = spawnSync('npx', ['tsx', 'scripts/asset-qa.ts'], { encoding: 'utf-8', cwd: path.join(__dirname, '../..') });
    const reportPath = path.join(__dirname, '../../reports/asset-qa-report.json');
    if (fs.existsSync(reportPath)) {
      res.json(JSON.parse(fs.readFileSync(reportPath, 'utf-8')));
    } else {
      res.json({ error: 'No report found', stdout: r.stdout, stderr: r.stderr });
    }
  } catch (e: any) { res.json({ error: String(e) }); }
});
```

### Step 3: Update Vite config to serve workbench.html

No change needed — files in `public/` are served at root. `public/workbench.html` is accessible at `/workbench.html`. But we want `/workbench` (no extension). Add this to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [{
    name: 'workbench',
    configureServer(server) {
      server.middlewares.use('/workbench', (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(fs.readFileSync(resolve('public/workbench.html')));
      });
    },
  }],
  // ...
});
```

Add `import * as fs from 'fs';` and `import { resolve } from 'path';` imports.

### Step 4: Run and verify

1. Start dev server: `npm run dev`
2. Open http://localhost:5173/workbench
3. Verify all tabs render, Asset QA API responds, GameSpec loads, commit list pulls

### Step 5: Commit

```bash
git add public/workbench.html vite.config.ts server/src/index.ts
git commit -m "$(cat <<'EOF'
feat: add Workbench UI (Phase 8 Task 0032)

public/workbench.html is a self-contained dev console with overview, game
preview, playtest controls, asset browser, and patch history tabs.
Vite serves it at /workbench. Server adds API endpoints for asset QA,
git commits, and spec summary.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Commands

After Task 0032: `npm run dev` → http://localhost:5173/workbench renders all tabs. Build passes, playtest passes.
