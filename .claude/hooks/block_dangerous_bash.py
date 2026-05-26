#!/usr/bin/env python3
"""Hook to block dangerous bash commands."""

import json
import sys
import re

DANGEROUS_PATTERNS = [
    r'\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(/|~|\$HOME|\*)',
    r'\brm\s+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*\s+(/|~|\$HOME|\*)',
    r'curl\s+[^|]*\|\s*(sh|bash|zsh)\b',
    r'wget\s+[^|]*\|\s*(sh|bash|zsh)\b',
    r'\bssh\s+',
    r'\bscp\s+',
    r'(^|\s)cat\s+[^\n]*\.env(\s|$)',
    r'(^|\s)cat\s+[^\n]*(id_rsa|id_ed25519|\.pem)\b',
]

def is_dangerous(command: str) -> bool:
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command):
            return True
    return False

def _read_command() -> str:
    """Claude Code PreToolUse hook passes JSON on stdin: tool_input.command. Argv kept for manual testing."""
    if not sys.stdin.isatty():
        data = sys.stdin.read().strip()
        if data:
            try:
                payload = json.loads(data)
                ti = payload.get("tool_input") or {}
                cmd = ti.get("command")
                if isinstance(cmd, str):
                    return cmd
            except json.JSONDecodeError:
                # Fall back to treating stdin as raw command (manual `echo cmd |` usage).
                return data
    if len(sys.argv) > 1:
        return " ".join(sys.argv[1:])
    return ""

def main():
    command = _read_command()
    if not command:
        return 0
    if is_dangerous(command):
        print(f"ERROR: Blocked dangerous command: {command}", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())