import express, { Request, Response } from 'express';

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

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`NPC AI server listening on http://localhost:${PORT}`));