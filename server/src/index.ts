import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const app = express();
app.use(express.json());

app.post('/api/npc/intent', async (req: Request, res: Response) => {
  const { npc = 'Verdant', playerStatement = '', context = 'village' } = req.body ?? {};
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.json({ npc, intent: 'idle', target: null, duration_ms: 10000 });
    return;
  }

  const VALID_INTENTS = ['greet', 'ask_question', 'give_item', 'idle', 'move_toward', 'move_away'];
  const systemPrompt = `You are ${npc}. Respond ONLY with JSON: {"npc":"${npc}","intent":"<one of: idle, greet, ask_question, give_item, move_toward, move_away>","target":null,"duration_ms":10000}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Player: "${playerStatement}". Context: ${context}` },
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
    const data = await response.json() as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);
    res.json({
      npc: parsed.npc ?? npc,
      intent: VALID_INTENTS.includes(parsed.intent) ? parsed.intent : 'idle',
      target: parsed.target ?? null,
      duration_ms: parsed.duration_ms ?? 10000,
    });
  } catch (err) {
    console.error('NPC intent error:', err);
    res.json({ npc, intent: 'idle', target: null, duration_ms: 10000 });
  }
});

app.get('/api/git/commits', (_req, res) => {
  try {
    const { execSync } = require('child_process');
    const out = execSync('git log --oneline -20 --format="%h %s %ad" --date=short', { encoding: 'utf-8' });
    const commits = out.trim().split('\n').map((line: string) => {
      const m = line.match(/^([a-f0-9]+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})$/);
      return m ? { hash: m[1], message: m[2], time: m[3] } : { hash: line.slice(0, 7), message: line.slice(8), time: '' };
    });
    res.json(commits);
  } catch { res.json([]); }
});

app.get('/api/spec-summary', (_req, res) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../../docs/GAME_SPEC.md'), 'utf-8');
    res.send(content.split('\n').slice(0, 50).join('\n') + '\n...');
  } catch { res.send('See docs/GAME_SPEC.md'); }
});

app.get('/api/asset-qa', (_req, res) => {
  try {
    spawnSync('npx', ['tsx', 'scripts/asset-qa.ts'], { encoding: 'utf-8', cwd: path.join(__dirname, '../..') });
    const reportPath = path.join(__dirname, '../../reports/asset-qa-report.json');
    if (fs.existsSync(reportPath)) {
      res.json(JSON.parse(fs.readFileSync(reportPath, 'utf-8')));
    } else {
      res.json({ totalAssets: 0, summary: { errors: 0, warnings: 0 }, issues: [] });
    }
  } catch (e: unknown) { res.json({ error: String(e) }); }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`NPC AI server listening on http://localhost:${PORT}`));
