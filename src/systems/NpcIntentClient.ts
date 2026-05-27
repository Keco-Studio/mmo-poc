export interface NpcIntentResponse {
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
    try {
      const response = await fetch(`${this._serverUrl}/api/npc/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npc, playerStatement, context }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<NpcIntentResponse>;
    } catch {
      return { npc, intent: 'idle', target: null, duration_ms: 10000 };
    }
  }
}