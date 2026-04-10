import { describe, it, expect } from 'vitest';
import { parseBoxShadow } from './box-shadow-parser';

describe('parseBoxShadow', () => {
  it('parses a standard drop shadow', () => {
    const s = parseBoxShadow('rgba(0, 0, 0, 0.25) 4px 4px 0px 0px');
    expect(s).toEqual({ x: 4, y: 4, color: 'rgba(0, 0, 0, 0.25)' });
  });

  it('parses negative offsets', () => {
    const s = parseBoxShadow('rgba(0, 0, 0, 0.5) -2px -3px 0px');
    expect(s?.x).toBe(-2);
    expect(s?.y).toBe(-3);
  });

  it('uses a default color when none is present', () => {
    const s = parseBoxShadow('4px 4px 0px 0px');
    expect(s?.x).toBe(4);
    expect(s?.color).toBe('rgba(0,0,0,0.3)');
  });

  it('returns null for none', () => {
    expect(parseBoxShadow('none')).toBeNull();
    expect(parseBoxShadow('')).toBeNull();
  });

  it('returns null for inset shadows (not supported)', () => {
    expect(parseBoxShadow('inset 2px 2px 0 red')).toBeNull();
  });

  it('returns null when x and y are both 0', () => {
    expect(parseBoxShadow('rgba(0,0,0,0.5) 0px 0px 0px')).toBeNull();
  });

  it('returns null when fewer than 2 length values', () => {
    expect(parseBoxShadow('rgba(0,0,0,0.5) 4px')).toBeNull();
  });
});
