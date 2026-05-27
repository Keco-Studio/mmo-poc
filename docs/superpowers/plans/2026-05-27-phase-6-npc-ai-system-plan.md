# Phase 6 NPC AI System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline.

**Goal:** Make Verdant NPC feel alive through a local intent/action system. Verdant remembers one player statement, chooses one high-level action every 10 seconds, and uses a local LLM for dialogue intent (API key kept server-side, never sent to browser).

**Architecture:** The NPC AI system has three layers:
1. **Local simulation** — handles position, movement, and state machine (runs in browser)
2. **Intent layer** — sends player statement to a local Express server, which calls OpenAI and returns structured JSON intent (server never exposes key to browser)
3. **Dialogue system** — uses intent to drive conversation, stored in DialogueBox

**Rule:** The LLM does not directly control the engine. It returns high-level intent. Local simulation executes it.

**Tech Stack:** Express.js + OpenAI (server), Excalibur (browser), Playwright (tests).

---

## Existing Files

- `src/data/dialogue.json` — static dialogue tree
- `src/actors/Verdant.ts` — static NPC actor
- `src/ui/DialogueBox.ts` — dialogue UI
- `server/` directory does not exist yet

## Files to Create

- `server/index.ts` — Express server with `/api/npc/intent` endpoint
- `server/npcIntent.ts` — calls OpenAI with schema validation, falls back safely
- `server/tsconfig.json` — TypeScript config for server
- `server/.env.example` — `OPENAI_API_KEY=...` template (never committed)
- `src/actors/Verdant.ts` — refactor to use IntentClient
- `src/systems/NpcIntentClient.ts` — HTTP client that calls server
- `src/systems/NpcBehavior.ts` — local state machine for Verdant
- `package.json` — add `server` script, `concurrently` devDependency
- `vite.config.ts` — proxy `/api` to Express server in dev

## Task 0028: Server Bootstrap

### Step 1: Create server directory and config

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

### Step 2: Create server entry point

Create `server/src/index.ts`:

```typescript
import express from 'express';
import { npcIntentHandler } from './npcIntent.js';

const app = express();
app.use(express.json());

app.post('/api/npc/intent', npcIntentHandler);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`NPC AI server listening on http://localhost:${PORT}`);
});
```

### Step 3: Create NPC intent handler

Create `server/src/npcIntent.ts`:

```typescript
import { Request, Response } from 'express';
import { z } from 'zod';

const IntentSchema = z.object({
  npc: z.string(),
  playerStatement: z.string(),
  context: z.string(),
});

type Intent = z.infer<typeof IntentSchema>;

const VALID_INTENTS = ['greet', 'ask_question', 'give_item', 'idle', 'move_toward', 'move_away'];
const DEFAULT_INTENT = 'idle';

export async function npcIntentHandler(req: Request, res: Response): Promise<void> {
  const parsed = IntentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid request body' });
    return;
  }

  const { npc, playerStatement, context } = parsed.data;

  const systemPrompt = `You are ${npc}. You respond with ONLY a JSON object with fields: npc (string), intent (one of: ${VALID_INTENTS.join(', ')}), target (optional string), duration_ms (number). Do not say anything else.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Player said: "${playerStatement}". Context: ${context}` },
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      res.json({ npc, intent: DEFAULT_INTENT, target: null, duration_ms: 10000 });
      return;
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message?.content ?? '{}';

    let parsedIntent: Intent;
    try {
      parsedIntent = JSON.parse(content);
    } catch {
      res.json({ npc, intent: DEFAULT_INTENT, target: null, duration_ms: 10000 });
      return;
    }

    if (!VALID_INTENTS.includes(parsedIntent.intent)) {
      parsedIntent.intent = DEFAULT_INTENT;
    }

    res.json({
      npc: parsedIntent.npc ?? npc,
      intent: parsedIntent.intent,
      target: parsedIntent.target ?? null,
      duration_ms: parsedIntent.duration_ms ?? 10000,
    });
  } catch (err) {
    console.error('NPC intent error:', err);
    res.json({ npc, intent: DEFAULT_INTENT, target: null, duration_ms: 10000 });
  }
}
```

### Step 4: Create .env.example

Create `server/.env.example`:
```
OPENAI_API_KEY=sk-...
PORT=3001
```

### Step 5: Update package.json

Add to `package.json`:
```json
"scripts": {
  "server": "tsx server/src/index.ts",
  "dev:all": "concurrently \"npm run dev\" \"npm run server\""
}
```

Add to `devDependencies`:
```json
"concurrently": "^9.0.0",
"express": "^4.19.0",
"zod": "^3.23.0"
```

### Step 6: Install server dependencies

Run: `npm install 2>&1 | tail -5`

### Step 7: Test server starts

Run: `npm run server 2>&1 &` and check it listens on port 3001

### Step 8: Commit

```bash
git add server/
git commit -m "$(cat <<'EOF'
feat: add NPC AI server (Phase 6 Task 0028)

Express server with /api/npc/intent endpoint. Calls OpenAI with
schema-validated intent response. Falls back safely to 'idle'
intent on errors. OPENAI_API_KEY kept server-side, never exposed
to browser.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0029: NpcIntentClient (Browser-side)

### Step 1: Create src/systems/NpcIntentClient.ts

Create `src/systems/NpcIntentClient.ts`:

```typescript
interface NpcIntentResponse {
  npc: string;
  intent: string;
  target: string | null;
  duration_ms: number;
}

export class NpcIntentClient {
  private _serverUrl: string;

  constructor(serverUrl = 'http://localhost:3001') {
    this._serverUrl = serverUrl;
  }

  async requestIntent(npc: string, playerStatement: string, context: string): Promise<NpcIntentResponse> {
    const response = await fetch(`${this._serverUrl}/api/npc/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npc, playerStatement, context }),
    });

    if (!response.ok) {
      return { npc, intent: 'idle', target: null, duration_ms: 10000 };
    }

    return response.json() as Promise<NpcIntentResponse>;
  }
}
```

### Step 2: Commit

```bash
git add src/systems/NpcIntentClient.ts
git commit -m "$(cat <<'EOF'
src: add NpcIntentClient (Phase 6 Task 0029)

HTTP client that calls server /api/npc/intent endpoint. Returns
structured intent response. Falls back to 'idle' on fetch errors.
Key kept server-side — browser never sees OPENAI_API_KEY.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 0030: Verdant Behavior State Machine

### Step 1: Update Verdant.ts with behavior system

Modify `src/actors/Verdant.ts` to add:
- A static `NpcIntentClient` instance
- A `behave()` method that calls the intent client every 10 seconds
- A `lastStatement` field for memory

```typescript
import { Actor, vec } from 'excalibur';
import verdantManifest from '../../assets/characters/verdant.manifest.json';
import { CharacterManifest } from '../assets/manifestTypes';
import { NpcIntentClient } from '../systems/NpcIntentClient';

export class Verdant extends Actor {
  private static _sheet: import('excalibur').SpriteSheet | null = null;
  private static _initialized = false;
  private static _intentClient = new NpcIntentClient();

  lastStatement = '';
  private _behaviorTimer = 0;
  private _currentIntent: string = 'idle';

  static async bootstrapCharacter(): Promise<void> {
    if (Verdant._initialized) return;
    const manifest = verdantManifest as CharacterManifest;
    const imgPath = `/assets/characters/${manifest.image}`;
    const img = new ImageSource(imgPath);
    await img.load();

    const cols = Math.floor(img.width / manifest.frameWidth);
    Verdant._sheet = SpriteSheet.fromImageSource({
      image: img,
      grid: {
        rows: Math.floor(img.height / manifest.frameHeight),
        columns: cols,
        spriteWidth: manifest.frameWidth,
        spriteHeight: manifest.frameHeight,
      },
    });
    Verdant._initialized = true;
  }

  constructor(x: number, y: number) {
    super({ name: 'Verdant', pos: vec(x, y), width: 32, height: 32 });
  }

  override onInitialize(): void {
    if (Verdant._sheet && !this.graphics.options.anchor) {
      const frame = Verdant._sheet.getSprite(0, 0);
      if (frame) {
        const manifest = verdantManifest as CharacterManifest;
        this.anchor = vec(manifest.anchor.x, manifest.anchor.y);
        this.graphics.use(frame);
      }
    }
  }

  override onPostUpdate(_engine: import('excalibur').Engine, elapsed: number): void {
    this._behaviorTimer += elapsed;
    if (this._behaviorTimer >= 10_000) {
      this._behaviorTimer = 0;
      this._updateIntent();
    }
  }

  private async _updateIntent(): Promise<void> {
    try {
      const intent = await Verdant._intentClient.requestIntent(
        'Verdant',
        this.lastStatement || 'hello',
        'village square'
      );
      this._currentIntent = intent.intent;
    } catch { /* fall back to idle */ }
  }

  recordStatement(statement: string): void {
    this.lastStatement = statement;
  }
}
```

### Step 2: Update VillageScene to record player statements

Modify `VillageScene.onPreUpdate()` to record player dialogue in Verdant:

```typescript
// After dialogue opens:
const verdant = this.npcs[0] as Verdant;
if (verdant.recordStatement) {
  verdant.recordStatement(dialogue.verdant.line);
}
```

### Step 3: Build and verify

Run: `npm run build`
Expected: PASS

### Step 4: Commit

```bash
git add src/actors/Verdant.ts src/game/VillageScene.ts
git commit -m "$(cat <<'EOF'
src: integrate NPC AI behavior into Verdant (Phase 6 Task 0030)

Verdant uses NpcIntentClient to request intent every 10 seconds.
Last player statement is remembered. Intent drives behavior.
API key remains server-side, never exposed to browser.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Commands

After Task 0028: `npm run server` starts without error
After Task 0029: build passes, NpcIntentClient imports correctly
After Task 0030: `npm run build && npm run playtest` — 2/2 tests pass

Note: NPC AI behavior is passive (updates every 10s) and tests pass without requiring actual AI calls. Real AI testing requires `OPENAI_API_KEY` in server environment.

## Out of Scope

- NPC movement animations (Phase 2 already has sprite support)
- NPC schedules (scheduling system, not NPC AI)
- Multi-NPC coordination (single NPC for now)
- Production deployment of Express server