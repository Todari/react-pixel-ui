import { createContext, useContext } from "react";
import { Global } from "@emotion/react";
import { GlobalStyle } from "./globalStyle";

interface PixelUIContextProps {
}

const PixelUIContext = createContext<PixelUIContextProps | undefined>(undefined);

export const PixelProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  
  return (
    <PixelUIContext.Provider value={{}}>
      <Global styles={GlobalStyle} />
      {children}
    </PixelUIContext.Provider>
  );
};

export const usePixel = (): PixelUIContextProps => {
  const context = useContext(PixelUIContext);
  if (!context) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
};
