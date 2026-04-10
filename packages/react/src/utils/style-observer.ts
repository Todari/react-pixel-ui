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
  /**
   * When true, the observer fires for external mutations to the element's
   * `style` attribute in addition to `class`. The caller must pause the
   * observer (via `pause()`) while applying its own inline styles, otherwise
   * a self-mutation loop will occur.
   */
  observeStyle?: boolean;
}

export interface StyleObserverHandle {
  disconnect: () => void;
  /** Suspend updates until the returned rAF callback resumes them. */
  pause: () => void;
}

export function createStyleObserver(
  element: HTMLElement,
  options: StyleObserverOptions,
): StyleObserverHandle {
  const {
    onUpdate,
    hover = true,
    focus = true,
    active = true,
    observeStyle = false,
  } = options;
  let rafId: number | null = null;
  let paused = false;

  const schedule = () => {
    if (paused) return;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (paused) return;
      onUpdate();
    });
  };

  // MutationObserver — watch class and optionally style attribute changes.
  // When observeStyle is true, callers MUST pause the observer around their
  // own inline style mutations to avoid infinite loops.
  const filter = observeStyle ? ['class', 'style'] : ['class'];
  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(element, {
    attributes: true,
    attributeFilter: filter,
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
      paused = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      for (const [event, handler] of listeners) {
        element.removeEventListener(event, handler);
      }
    },
    pause() {
      paused = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // Drain any queued MutationObserver records from our own mutations
      // so the resume doesn't immediately re-fire.
      mutationObserver.takeRecords();
      requestAnimationFrame(() => {
        // Drain again after the browser has applied pending changes
        mutationObserver.takeRecords();
        paused = false;
      });
    },
  };
}
