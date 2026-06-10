import { createContext, useContext, useState, type ReactNode } from "react";

type MobileActionsContextValue = {
  isPaneOpen: boolean;
  togglePane: () => void;
  closePane: () => void;
};

const MobileActionsContext = createContext<MobileActionsContextValue | null>(
  null,
);

type MobileActionsProviderProps = {
  children: ReactNode;
};

export function MobileActionsProvider({
  children,
}: Readonly<MobileActionsProviderProps>) {
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  const togglePane = () => {
    setIsPaneOpen((current) => !current);
  };

  const closePane = () => {
    setIsPaneOpen(false);
  };

  return (
    <MobileActionsContext.Provider
      value={{ isPaneOpen, togglePane, closePane }}
    >
      {children}
    </MobileActionsContext.Provider>
  );
}

export function useMobileActions(): MobileActionsContextValue {
  const context = useContext(MobileActionsContext);

  if (!context) {
    throw new Error(
      "useMobileActions must be used within MobileActionsProvider",
    );
  }

  return context;
}
