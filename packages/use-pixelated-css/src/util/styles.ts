import { BoxStyles, BoxStylesKeys, StyleMap } from "../type";

export const styleMap = (ref: React.RefObject<HTMLElement>) => {
  const styleMap: StyleMap = {};
  ref.current?.computedStyleMap().forEach((value, key) => {
      const valueArray = Array.from(value.values());
      styleMap[key] = valueArray.map((value) => value.toString());
  })

  return styleMap;
}

const STYLE_GROUPS: BoxStyles = {
    contentBox: {
      background: ['background', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-size'],
      text: ['color', 'font-size', 'font-family', 'text-align', 'line-height'],
      size: ['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height']
    },
    paddingBox: {
      padding: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left']
    },
    borderBox: {
      border: ['border', 'border-width', 'border-style', 'border-color'],
      borderSides: ['border-top', 'border-right', 'border-bottom', 'border-left'],
      borderRadius: ['border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
      shadow: ['box-shadow']
    },
    marginBox: {
      margin: ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
      outline: ['outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset']
    }
  };

export const boxStyles = (ref: React.RefObject<HTMLElement>): BoxStyles => {
  const styles = styleMap(ref);

  return Object.entries(STYLE_GROUPS).reduce((acc, [boxKey, groups]) => {
    acc[boxKey as BoxStylesKeys] = Object.values(groups).flat().reduce((groupAcc, prop) => {
      groupAcc[prop] = styles[prop] || [];
      return groupAcc;
    }, {} as StyleMap);
    return acc;
  }, {} as BoxStyles);
};