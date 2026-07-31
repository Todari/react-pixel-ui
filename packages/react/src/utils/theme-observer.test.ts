import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeRootThemeChanges } from "./theme-observer";

describe("subscribeRootThemeChanges", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shares one observer and disconnects after the last subscriber leaves", () => {
    const captured: { mutationCallback?: MutationCallback } = {};
    const disconnect = vi.fn();
    const observe = vi.fn();
    const MutationObserverMock = vi.fn(function (
      this: MutationObserver,
      callback: MutationCallback,
    ) {
      captured.mutationCallback = callback;
      return { disconnect, observe, takeRecords: () => [] };
    });
    const requestAnimationFrameMock = vi.fn(
      (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    );

    vi.stubGlobal("MutationObserver", MutationObserverMock);
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);

    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = subscribeRootThemeChanges(first);
    const unsubscribeSecond = subscribeRootThemeChanges(second);

    expect(MutationObserverMock).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);

    const mutationCallback = captured.mutationCallback;
    if (!mutationCallback)
      throw new Error("Mutation callback was not captured");
    mutationCallback([], {} as MutationObserver);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    unsubscribeFirst();
    expect(disconnect).not.toHaveBeenCalled();
    unsubscribeSecond();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
