# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stealth Vocab** is a browser extension for IELTS vocabulary learning that integrates seamlessly into work workflows. It's designed as a sidebar/overlay widget that allows users to utilize micro-breaks (10-30 seconds) for vocabulary review without disrupting their work.

### Core Product Vision
- Transform office micro-breaks into efficient, covert IELTS vocabulary learning time
- Browser sidebar/overlay widget format
- MVP goal: Validate user behavior of actively using micro-breaks for review

### Key Architecture Requirements

#### Performance Critical
- **Instant response**: All interactions (launch, hide, flip, jump) must be < 150ms
- **State persistence**: Real-time saving of current word ID, flip state, and review list index
- **Zero loading delay**: No animations or sound effects

#### User Interaction Flow
1. **Global hotkey**: `Ctrl+Shift+V` for instant show/hide
2. **Context restoration**: Reopen to exact previous state
3. **Self-testing**: Shows Chinese definition first, flip to reveal English + phonetics
4. **Three-state feedback**: `✅ Mastered`, `❓ Vague`, `❌ Forgotten`
5. **Progress tracking**: "X words reviewed today" counter

## Technical Architecture (MVP)

### Browser Extension Structure
- **Chrome Extension Manifest V3** compatible
- **Sidebar/Overlay UI**: Narrow, tall floating window with dark low-contrast UI
- **Storage**: Local/Cloud persistence for user progress and state

### Core Components

#### 1. Hotkey System (`C1`)
- Global keyboard shortcut registration
- Instant show/hide functionality (< 100ms)

#### 2. State Management (`C2`)
- Current word ID persistence
- Flip state tracking
- Review list index management

#### 3. Review Interface (`C3`)
- Minimal dark UI design
- Chinese definition display
- English word + phonetics on flip
- Three-state feedback buttons
- Simple progress bar

#### 4. Review Algorithm (`C6`)
- Priority: "forgotten" words first
- Fallback: fixed order rotation

## Development Guidelines

### MVP Focus
- **Performance over features**: All interactions must be sub-150ms
- **Stealth design**: Low visual profile, dark theme, minimal contrast
- **Reliability**: State persistence is critical to avoid user frustration

### Key Implementation Notes
- No animations or sound effects
- Instant context restoration required
- Compatibility with Chrome/Edge (Chromium browsers)
- Test hotkey conflicts with office software (Office Web, Slack, Google Docs)

### Data Structure
```typescript
interface StudyState {
  currentWordId: string;
  isFlipped: boolean;
  currentIndex: number;
  todayReviewCount: number;
  wordStatuses: Record<string, 'mastered' | 'vague' | 'forgotten'>;
}
```

## Testing Priorities
1. **Hotkey reliability**: Ensure `Ctrl+Shift+V` works consistently
2. **State persistence**: Verify data survives browser restarts
3. **Performance**: Measure all interaction latencies
4. **Compatibility**: Test across Chromium browsers
5. **Conflict testing**: Verify hotkey doesn't interfere with office web apps

## Success Metrics
- Core users (5+ days/week) average ≥ 10 daily wake-ups
- Instant show/hide functionality
- Reliable state persistence across sessions
- 每次完成任务，需要更新任务状态