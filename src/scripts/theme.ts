import { writeStorage } from '../../lib/storage';
import { parseTheme, ThemeSession } from '../lib/theme-state';
import type { SceneHandle } from './f1-scene';

const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

if (toggle) {
  const state = new ThemeSession(parseTheme(root.dataset.theme ?? null));
  let sceneModule: Promise<typeof import('./f1-scene')> | undefined;
  let scene: SceneHandle | undefined;
  let preparation: AbortController | undefined;
  let overlay: HTMLDivElement | undefined;
  let skip: HTMLButtonElement | undefined;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let animations: Animation[] = [];
  let started = 0;
  let path = 'instant';

  function load() {
    if (!sceneModule) sceneModule = import('./f1-scene').catch(error => { sceneModule = undefined; throw error; });
    return sceneModule;
  }
  function prepareIntent() {
    if (!reduced.matches && state.desired === 'professional' && !state.active) void load().catch(() => {});
  }
  function commit() {
    root.dataset.theme = state.desired;
    toggle!.setAttribute('aria-pressed', String(state.desired === 'f1'));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.desired === 'f1' ? '#10151e' : '#f7f8fa');
    writeStorage('local', 'portfolio-theme', state.desired);
  }
  function settle() {
    if (!state.active) return;
    commit();
    state.finish(); // Invalidates any outstanding imports / shader preparation.
    preparation?.abort(); preparation = undefined;
    timers.forEach(clearTimeout); timers = [];
    animations.forEach(animation => animation.cancel()); animations = [];
    scene?.dispose(); scene = undefined;
    const restoreFocus = document.activeElement === skip;
    overlay?.remove(); overlay = undefined;
    skip?.remove(); skip = undefined;
    root.classList.remove('theme-transitioning');
    root.dataset.transition = 'idle';
    if (restoreFocus) toggle!.focus({ preventScroll: true });
    const announcement = document.querySelector('#theme-announcement');
    if (announcement) announcement.textContent = state.desired === 'f1' ? 'F1 mode enabled' : 'Professional mode enabled';
    document.dispatchEvent(new CustomEvent('portfolio:transition-end', { detail: { theme: state.desired, path, duration: performance.now() - started } }));
  }
  function later(id: number, callback: () => void, delay: number) {
    timers.push(setTimeout(() => { if (state.isCurrent(id)) callback(); }, Math.max(0, delay)));
  }
  function animate(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
    const animation = element.animate(frames, options);
    animations.push(animation);
    return animation;
  }
  function sweep(id: number, duration: number) {
    if (!overlay) return;
    root.dataset.transition = 'settling';
    overlay.querySelector<HTMLElement>('.starting-lights')!.style.display = 'none';
    overlay.querySelector<HTMLElement>('.transition-caption')!.style.display = 'none';
    commit();
    animate(overlay, [{ clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' }, { clipPath: 'polygon(120% 0,100% 0,100% 100%,100% 100%)' }], { duration, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' });
    later(id, settle, duration);
  }
  async function request() {
    const { id, target, interrupted } = state.request();
    if (interrupted) { path = 'interrupted'; settle(); return; }
    started = performance.now();
    if (reduced.matches) { path = 'reduced'; settle(); return; }
    path = target === 'f1' ? 'fallback' : 'return';
    const abort = new AbortController(); preparation = abort;
    root.dataset.transition = 'preparing';
    root.classList.add('theme-transitioning');
    overlay = document.createElement('div'); overlay.className = 'f1-overlay'; overlay.setAttribute('aria-hidden', 'true');
    const lights = document.createElement('div'); lights.className = 'starting-lights';
    for (let i = 0; i < 5; i++) lights.append(document.createElement('i'));
    const caption = document.createElement('div'); caption.className = 'transition-caption'; caption.textContent = 'LIGHTS OUT';
    const stripe = document.createElement('div'); stripe.className = 'launch-stripe';
    overlay.append(lights, caption, stripe);
    overlay.addEventListener('click', event => { event.stopPropagation(); settle(); });
    skip = document.createElement('button'); skip.type = 'button'; skip.className = 'transition-skip'; skip.textContent = 'Skip animation'; skip.addEventListener('click', settle);
    document.body.append(overlay, skip);
    animate(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 100, fill: 'forwards' });
    later(id, settle, 2500);
    if (target === 'professional') { overlay.classList.add('returning'); sweep(id, 450); return; }
    [...lights.children].forEach((light, i) => later(id, () => light.classList.add('lit'), 120 + i * 80));
    let expired = false;
    later(id, () => {
      if (!scene) { expired = true; abort.abort(); sweep(id, 200); }
    }, 500);
    later(id, () => {
      if (!scene || expired) return;
      path = 'rich'; root.dataset.transition = 'playing';
      lights.style.display = 'none'; caption.style.display = 'none';
      const canvas = overlay?.querySelector('canvas'); if (canvas) canvas.style.opacity = '1';
      scene.play({
        onReveal: () => {
          if (!state.isCurrent(id) || !overlay) return;
          animate(stripe, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], { duration: 500, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' });
          sweep(id, 600);
        },
        onComplete: () => { if (state.isCurrent(id)) settle(); },
      });
    }, 650);
    try {
      const module = await load();
      if (!state.isCurrent(id) || expired || reduced.matches || !overlay) return;
      const canvas = document.createElement('canvas');
      canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); if (state.isCurrent(id) && !abort.signal.aborted) settle(); }, { once: true });
      overlay.prepend(canvas);
      const prepared = await module.prepareScene(canvas, abort.signal);
      if (!state.isCurrent(id) || expired || reduced.matches) prepared.dispose(); else scene = prepared;
    } catch { if (state.isCurrent(id) && !expired) { expired = true; sweep(id, 200); } }
  }
  toggle.hidden = false;
  toggle.setAttribute('aria-pressed', String(state.desired === 'f1'));
  root.dataset.transition = 'idle';
  toggle.addEventListener('pointerenter', prepareIntent);
  toggle.addEventListener('focus', prepareIntent);
  toggle.addEventListener('pointerdown', prepareIntent);
  toggle.addEventListener('click', () => { void request(); });
  document.addEventListener('keydown', event => {
    if (!state.active || !['Escape', 'Tab'].includes(event.key)) return;
    if (event.key === 'Escape') event.preventDefault();
    settle();
  });
  window.addEventListener('wheel', settle, { passive: true });
  window.addEventListener('touchmove', settle, { passive: true });
  window.addEventListener('pagehide', settle);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); });
}
