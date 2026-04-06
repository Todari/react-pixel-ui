/**
 * Singleton manager for injected <style> rules used by usePixelRef
 * to create ::before pseudo-elements for borders.
 * Uses textContent for maximum browser compatibility.
 */

let styleElement: HTMLStyleElement | null = null;
let nextId = 0;
const rules = new Map<string, string>(); // uid → CSS rule text

function ensureStyleElement(): void {
  if (styleElement && styleElement.parentNode) return;
  if (typeof document === 'undefined') return;
  styleElement = document.createElement('style');
  styleElement.setAttribute('data-pixel-ui', '');
  document.head.appendChild(styleElement);
}

function updateStyleContent(): void {
  if (!styleElement) return;
  styleElement.textContent = Array.from(rules.values()).join('\n');
}

export function allocateId(): string {
  return `px-${++nextId}`;
}

export function setRule(uid: string, css: string): void {
  if (typeof document === 'undefined') return;
  ensureStyleElement();
  rules.set(uid, css);
  updateStyleContent();
}

export function removeRule(uid: string): void {
  if (!rules.has(uid)) return;
  rules.delete(uid);
  updateStyleContent();
}
