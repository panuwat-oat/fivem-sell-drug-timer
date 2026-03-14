# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file HTML interval timer designed for FiveM sell-drug timing. It runs entirely in the browser with no build system, dependencies, or server required.

**To run:** Open `timer.html` directly in a browser.

## Architecture

Everything lives in [timer.html](timer.html) — HTML structure, CSS styles, and JavaScript logic are all inline in one file.

### Core Logic

- `TOTAL = 300` — interval duration in seconds (5 minutes), the main constant to adjust timing
- Timer operates on absolute wall-clock timestamps (`*Ms` variables in milliseconds), not elapsed countdowns
- `firstStartMs` / `currentStartMs` / `currentTargetMs` — anchor the current loop to real clock time
- `loopIndex` + `alertedLoops` (Set) prevent duplicate alerts per loop
- `tick()` runs every 500ms via `setInterval`, computes remaining time from `currentTargetMs - Date.now()`
- When the target is reached, `doAlert()` fires, logs the completed loop, and advances `currentStartMs`/`currentTargetMs` by `TOTAL * 1000`

### UI States

Two mutually exclusive views toggled by CSS classes:
- **Setup** (`#setup`): HH/MM/SS input fields for the first interval's start time
- **Timer** (`#timer`): countdown display, progress bar, loop history log

Warning state (red color + `.warning` class) activates at ≤30 seconds remaining.

### Alert System

`doAlert()` triggers:
1. Web Audio API beep (4-note sequence via `AudioContext`)
2. CSS flash animation on `#alertOverlay` (border flash, 1.4s)
3. Loop appended to `#loopLog` history
