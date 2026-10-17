import { describe, expect, it } from 'vitest';
import { parseTheme, ThemeSession } from '../src/lib/theme-state';
describe('theme request ownership', () => {
  it('validates persisted values', () => { expect(parseTheme('f1')).toBe('f1'); expect(parseTheme('corrupt')).toBe('professional'); expect(parseTheme(null)).toBe('professional'); });
  it('toggles the latest intent and invalidates late work', () => {
    const state = new ThemeSession('professional');
    const first = state.request();
    expect(first.target).toBe('f1');
    expect(state.isCurrent(first.id)).toBe(true);
    const second = state.request();
    expect(second.target).toBe('professional');
    expect(second.interrupted).toBe(true);
    expect(state.isCurrent(first.id)).toBe(false);
    expect(state.finish()).toBe('professional');
    expect(state.isCurrent(second.id)).toBe(false);
  });
  it('does not allow a disposed session to become current again', () => {
    const state = new ThemeSession('f1');
    const previous = state.request();
    state.finish();
    const next = state.request();
    expect(next.id).not.toBe(previous.id);
    expect(state.isCurrent(previous.id)).toBe(false);
  });
});
