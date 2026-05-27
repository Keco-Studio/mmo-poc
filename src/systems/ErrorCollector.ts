const MAX_ERRORS = 50;

let _errors: string[] = [];
let _originalConsoleError: (...args: unknown[]) => void;
let _originalWindowError: OnErrorEventHandler | null = null;

export function startErrorCollection(): void {
  _originalConsoleError = console.error.bind(console);
  _originalWindowError = window.onerror;

  console.error = (...args: unknown[]) => {
    const msg = args.map(a => String(a)).join(' ');
    _errors.push(msg);
    if (_errors.length > MAX_ERRORS) _errors.shift();
    _originalConsoleError(...args);
  };

  window.onerror = (message, source, lineno, colno, error) => {
    const msg = [String(message), source, `${lineno}:${colno}`, error?.stack].filter(Boolean).join(' | ');
    _errors.push(msg);
    if (_errors.length > MAX_ERRORS) _errors.shift();
    return false;
  };
}

export function getCollectedErrors(): string[] {
  return [..._errors];
}

export function clearErrors(): void {
  _errors = [];
}

export function stopErrorCollection(): void {
  console.error = _originalConsoleError;
  if (_originalWindowError) window.onerror = _originalWindowError;
}