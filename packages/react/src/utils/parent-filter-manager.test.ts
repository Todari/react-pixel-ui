import { describe, expect, it } from "vitest";
import {
  releaseManagedParentFilter,
  setManagedParentFilter,
} from "./parent-filter-manager";

describe("parent filter manager", () => {
  it("preserves the parent filter and coordinates sibling registrations", () => {
    const parent = document.createElement("div");
    parent.style.filter = "blur(2px)";
    document.body.appendChild(parent);
    const first = Symbol("first");
    const second = Symbol("second");

    setManagedParentFilter(parent, first, "drop-shadow(4px 4px 0 #000)");
    expect(parent.style.filter).toContain("blur(2px)");
    expect(parent.style.filter).toContain("drop-shadow(4px 4px 0 #000)");

    setManagedParentFilter(parent, second, "drop-shadow(8px 8px 0 #f00)");
    expect(parent.style.filter).toContain("drop-shadow(4px 4px 0 #000)");
    expect(parent.style.filter).toContain("drop-shadow(8px 8px 0 #f00)");

    releaseManagedParentFilter(parent, first);
    expect(parent.style.filter).toContain("blur(2px)");
    expect(parent.style.filter).not.toContain("drop-shadow(4px 4px 0 #000)");
    expect(parent.style.filter).toContain("drop-shadow(8px 8px 0 #f00)");

    releaseManagedParentFilter(parent, second);
    expect(parent.style.filter).toBe("blur(2px)");
    parent.remove();
  });

  it("deduplicates identical sibling filters until all users release them", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const first = Symbol("first");
    const second = Symbol("second");
    const shadow = "drop-shadow(4px 4px 0 #000)";

    setManagedParentFilter(parent, first, shadow);
    setManagedParentFilter(parent, second, shadow);
    expect(parent.style.filter).toBe(shadow);

    releaseManagedParentFilter(parent, first);
    expect(parent.style.filter).toBe(shadow);
    releaseManagedParentFilter(parent, second);
    expect(parent.style.filter).toBe("");
    parent.remove();
  });
});
