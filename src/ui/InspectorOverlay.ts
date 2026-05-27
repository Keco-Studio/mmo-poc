export interface InspectorState {
  fps: number;
  player: { x: number; y: number };
  npcs: { id: string; name: string; x: number; y: number }[];
  ui: { promptVisible: boolean; dialogueOpen: boolean };
  errors: string[];
}

export class InspectorOverlay {
  private _el: HTMLDivElement;
  private _fpsEl: HTMLDivElement;
  private _playerEl: HTMLDivElement;
  private _npcEl: HTMLDivElement;
  private _uiEl: HTMLDivElement;
  private _errEl: HTMLDivElement;
  private _visible = false;

  constructor() {
    this._el = document.createElement('div');
    this._el.id = 'inspector-overlay';
    this._el.style.cssText = [
      'position:fixed',
      'top:8px',
      'right:8px',
      'width:220px',
      'background:rgba(10,10,10,0.88)',
      'color:#0f0',
      'font:11px/1.4 monospace',
      'padding:8px',
      'border:1px solid #0f0',
      'border-radius:4px',
      'z-index:9999',
      'display:none',
      'max-height:90vh',
      'overflow:hidden',
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'font-weight:bold;margin-bottom:6px;border-bottom:1px solid #0f0;padding-bottom:4px;cursor:pointer';
    header.textContent = 'Inspector';
    header.onclick = () => this.toggle();
    this._el.appendChild(header);

    this._fpsEl = this._mkSection('FPS');
    this._playerEl = this._mkSection('Player');
    this._npcEl = this._mkSection('NPCs');
    this._uiEl = this._mkSection('UI');
    this._errEl = this._mkSection('Errors (0)');

    document.body.appendChild(this._el);
  }

  private _mkSection(label: string): HTMLDivElement {
    const el = document.createElement('div');
    el.style.cssText = 'margin-top:6px';
    const lbl = document.createElement('div');
    lbl.style.cssText = 'color:#888';
    lbl.textContent = label;
    el.appendChild(lbl);
    this._el.appendChild(el);
    return el;
  }

  toggle(): void {
    this._visible = !this._visible;
    this._el.style.display = this._visible ? 'block' : 'none';
  }

  show(): void {
    this._visible = true;
    this._el.style.display = 'block';
  }

  update(state: InspectorState): void {
    if (!this._visible) return;
    this._fpsEl.querySelector('div:last-child')!.textContent = state.fps.toFixed(1);
    this._playerEl.querySelector('div:last-child')!.textContent =
      `x:${state.player.x.toFixed(0)} y:${state.player.y.toFixed(0)}`;
    this._npcEl.querySelector('div:last-child')!.textContent =
      state.npcs.map(n => `${n.name}(${n.x.toFixed(0)},${n.y.toFixed(0)})`).join(' | ') || 'none';
    this._uiEl.querySelector('div:last-child')!.textContent =
      `prompt:${state.ui.promptVisible} dialog:${state.ui.dialogueOpen}`;
    this._errEl.querySelector('div:first-child')!.textContent = `Errors (${state.errors.length})`;
    this._errEl.querySelector('div:last-child')!.textContent =
      state.errors.slice(-3).join(' | ') || 'none';
  }
}