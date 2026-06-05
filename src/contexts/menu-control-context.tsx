import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MenuType = "add-note" | "settings";

type MenuControlContextValue = {
  openMenu: MenuType | null;
  isMenuOpen: (menu: MenuType) => boolean;
  openMenuByType: (menu: MenuType) => void;
  closeMenu: () => void;
  toggleMenu: (menu: MenuType) => void;
};

const MenuControlContext = createContext<MenuControlContextValue | undefined>(
  undefined,
);

type MenuControlProviderProps = {
  children: ReactNode;
};

export function MenuControlProvider({
  children,
}: Readonly<MenuControlProviderProps>) {
  const [openMenu, setOpenMenu] = useState<MenuType | null>(null);

  const value = useMemo<MenuControlContextValue>(
    () => ({
      openMenu,
      isMenuOpen: (menu) => openMenu === menu,
      openMenuByType: (menu) => setOpenMenu(menu),
      closeMenu: () => setOpenMenu(null),
      toggleMenu: (menu) => {
        setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
      },
    }),
    [openMenu],
  );

  return (
    <MenuControlContext.Provider value={value}>
      {children}
    </MenuControlContext.Provider>
  );
}

export function useMenuControl(): MenuControlContextValue {
  const context = useContext(MenuControlContext);

  if (!context) {
    throw new Error("useMenuControl must be used within MenuControlProvider");
  }

  return context;
}
