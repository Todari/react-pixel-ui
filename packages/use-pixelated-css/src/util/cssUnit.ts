export function pixelUnit(value: string, element: HTMLElement): number {
  if (!value) return 0;
  
  const match = /^([\d.]+)([a-z%]*)$/.exec(value);
  if (!match) return 0;

  const num = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'px':
      return num;
    case 'rem':
      return num * parseFloat(getComputedStyle(document.documentElement).fontSize);
    case 'em':
      return num * parseFloat(getComputedStyle(element.parentElement!).fontSize);
    case '%':
      return (num / 100) * element.clientWidth;
    case 'vw':
      return (num / 100) * window.innerWidth;
    case 'vh':
      return (num / 100) * window.innerHeight;
    default:
      return num;
  }
}