/**
 * Observe style-relevant changes on a DOM element.
 * Combines MutationObserver, ResizeObserver, and CSS pseudo-class events.
 * All callbacks are rAF-debounced.
 */

export interface StyleObserverOptions {
  onUpdate: () => void;
  hover?: boolean;
  focus?: boolean;
  active?: boolean;
}

export function createStyleObserver(
  element: HTMLElement,
  options: StyleObserverOptions,
): { disconnect: () => void } {
  const { onUpdate, hover = true, focus = true, active = true } = options;
  let rafId: number | null = null;

  const schedule = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      onUpdate();
    });
  };

  // MutationObserver — class and style attribute changes
  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'style'],
  });

  // ResizeObserver — dimension changes
  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(element);

  // Event listeners for CSS pseudo-class changes
  const listeners: Array<[string, EventListener]> = [];

  const addListener = (event: string) => {
    const handler = schedule as EventListener;
    element.addEventListener(event, handler);
    listeners.push([event, handler]);
  };

  if (hover) {
    addListener('mouseenter');
    addListener('mouseleave');
  }
  if (focus) {
    addListener('focusin');
    addListener('focusout');
  }
  if (active) {
    addListener('pointerdown');
    addListener('pointerup');
  }

  return {
    disconnect() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      for (const [event, handler] of listeners) {
        element.removeEventListener(event, handler);
      }
    },
  };
}
