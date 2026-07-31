type ThemeSubscriber = () => void;

const subscribers = new Set<ThemeSubscriber>();
let observer: MutationObserver | null = null;
let rafId: number | null = null;

function notifySubscribers(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    for (const subscriber of subscribers) subscriber();
  });
}

function startObserver(): void {
  if (observer || typeof document === "undefined") return;
  if (typeof MutationObserver === "undefined") return;

  observer = new MutationObserver(notifySubscribers);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
  }
}

function stopObserver(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  observer?.disconnect();
  observer = null;
}

/**
 * Subscribe to root theme changes using one shared MutationObserver.
 * A page with many <Pixel> instances therefore pays for one root observer,
 * rather than one observer per component.
 */
export function subscribeRootThemeChanges(
  subscriber: ThemeSubscriber,
): () => void {
  subscribers.add(subscriber);
  startObserver();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stopObserver();
  };
}
