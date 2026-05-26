#!/usr/bin/env python3
"""Scope guard hook - blocks edits outside allowedFiles in active TaskSpec."""

import json
import os
import sys
import fnmatch

def get_active_task_path():
    return os.path.join(os.getcwd(), "tasks", "in-progress", "current.json")

def load_task_spec(path):
    if not os.path.exists(path):
        return None
    with open(path, "r") as f:
        return json.load(f)

def _match_segments(path: str, pattern: str) -> bool:
    """Match path against pattern segment-by-segment so '*' does not cross '/'.
    '**' matches zero or more segments. Plain segments use fnmatch on a single segment.
    """
    p_segs = path.split("/")
    pat_segs = pattern.split("/")

    def helper(pi: int, ti: int) -> bool:
        while pi < len(pat_segs):
            seg = pat_segs[pi]
            if seg == "**":
                if pi == len(pat_segs) - 1:
                    return True
                for k in range(ti, len(p_segs) + 1):
                    if helper(pi + 1, k):
                        return True
                return False
            if ti >= len(p_segs):
                return False
            if not fnmatch.fnmatchcase(p_segs[ti], seg):
                return False
            pi += 1
            ti += 1
        return ti == len(p_segs)

    return helper(0, 0)

def _relpath(file_path: str) -> str:
    file_path = os.path.normpath(file_path)
    if os.path.isabs(file_path):
        try:
            rel = os.path.relpath(file_path, os.getcwd())
            if not rel.startswith(".."):
                file_path = rel
        except ValueError:
            pass
    return file_path.replace(os.sep, "/")

def is_path_allowed(file_path: str, patterns: list) -> bool:
    fp = _relpath(file_path)
    for pattern in patterns:
        pat = os.path.normpath(pattern).replace(os.sep, "/")
        if fp == pat:
            return True
        if "*" in pat and _match_segments(fp, pat):
            return True
    return False

def _read_file_path_from_input() -> str:
    """Claude Code hooks receive JSON on stdin; argv kept as a fallback for manual testing."""
    if not sys.stdin.isatty():
        data = sys.stdin.read().strip()
        if data:
            try:
                payload = json.loads(data)
                ti = payload.get("tool_input") or {}
                for key in ("file_path", "path", "notebook_path"):
                    if isinstance(ti.get(key), str):
                        return ti[key]
            except json.JSONDecodeError:
                pass
    if len(sys.argv) >= 2:
        return sys.argv[1]
    return ""

def main():
    file_path = _read_file_path_from_input()
    if not file_path:
        sys.exit(0)

    task = load_task_spec(get_active_task_path())
    if task is None:
        sys.exit(0)

    forbidden = task.get("forbiddenFiles", [])
    if is_path_allowed(file_path, forbidden):
        print(f"SCOPE GUARD: '{file_path}' is in forbiddenFiles of active task.", file=sys.stderr)
        print(f"Active task: {task.get('taskId', 'unknown')}", file=sys.stderr)
        sys.exit(1)

    # Only enforce allowedFiles when explicitly declared; absent key means no scope restriction.
    if "allowedFiles" in task:
        allowed = task["allowedFiles"] or []
        if not is_path_allowed(file_path, allowed):
            print(f"SCOPE GUARD: '{file_path}' is not in allowedFiles of active task.", file=sys.stderr)
            print(f"Active task: {task.get('taskId', 'unknown')}", file=sys.stderr)
            print(f"Allowed files: {allowed}", file=sys.stderr)
            sys.exit(1)

    sys.exit(0)

if __name__ == "__main__":
    main()