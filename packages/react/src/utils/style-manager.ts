/**
 * Singleton manager for injected <style> rules used by usePixelRef
 * to create ::before pseudo-elements for borders.
 */

let styleElement: HTMLStyleElement | null = null;
let nextId = 0;
const rules = new Map<string, number>(); // uid → rule index

function ensureStyleElement(): HTMLStyleElement {
  if (styleElement && styleElement.parentNode) return styleElement;
  styleElement = document.createElement('style');
  styleElement.setAttribute('data-pixel-ui', '');
  document.head.appendChild(styleElement);
  return styleElement;
}

export function allocateId(): string {
  return `px-${++nextId}`;
}

export function setRule(uid: string, css: string): void {
  if (typeof document === 'undefined') return;

  const el = ensureStyleElement();
  const sheet = el.sheet;
  if (!sheet) return;

  // Remove old rule for this uid
  removeRule(uid);

  // Insert new rule
  const index = sheet.insertRule(css, sheet.cssRules.length);
  rules.set(uid, index);
}

export function removeRule(uid: string): void {
  if (!styleElement?.sheet) return;
  const sheet = styleElement.sheet;

  const index = rules.get(uid);
  if (index !== undefined) {
    // Find actual index (may shift after deletions)
    for (let i = 0; i < sheet.cssRules.length; i++) {
      if ((sheet.cssRules[i] as CSSStyleRule).selectorText?.includes(uid)) {
        sheet.deleteRule(i);
        break;
      }
    }
    rules.delete(uid);
  }
}
