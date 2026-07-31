interface ParentFilterState {
  originalInlineFilter: string;
  baseFilter: string;
  registrations: Map<symbol, string>;
}

const parentFilterStates = new WeakMap<HTMLElement, ParentFilterState>();

function normalizedFilter(filter: string): string {
  return filter && filter !== "none" ? filter : "";
}

function applyManagedFilters(
  element: HTMLElement,
  state: ParentFilterState,
): void {
  const managedFilters = Array.from(new Set(state.registrations.values()));
  element.style.filter = [state.baseFilter, ...managedFilters]
    .filter(Boolean)
    .join(" ");
}

/**
 * Add a filter without discarding filters already supplied by the parent.
 * Registrations are reference-counted so sibling usePixelRef instances do not
 * restore or overwrite one another's parent filter.
 */
export function setManagedParentFilter(
  element: HTMLElement,
  token: symbol,
  filter: string,
): void {
  let state = parentFilterStates.get(element);
  if (!state) {
    state = {
      originalInlineFilter: element.style.filter,
      baseFilter: normalizedFilter(getComputedStyle(element).filter),
      registrations: new Map(),
    };
    parentFilterStates.set(element, state);
  }

  state.registrations.set(token, filter);
  applyManagedFilters(element, state);
}

export function releaseManagedParentFilter(
  element: HTMLElement,
  token: symbol,
): void {
  const state = parentFilterStates.get(element);
  if (!state) return;

  state.registrations.delete(token);
  if (state.registrations.size > 0) {
    applyManagedFilters(element, state);
    return;
  }

  element.style.filter = state.originalInlineFilter;
  parentFilterStates.delete(element);
}
