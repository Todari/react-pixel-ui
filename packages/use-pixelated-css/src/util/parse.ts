export function parsePosition(position: string): [string, string] {
  const [x, y] = position?.split(' ') || [];
  return [x || '0%', y || '0%'];
}

export function parseSize(size: string): [string, string] {
  if (size === 'cover' || size === 'contain') {
    return [size, size];
  }
  const [width, height] = size?.split(' ') || [];
  return [width || 'auto', height || 'auto'];
}