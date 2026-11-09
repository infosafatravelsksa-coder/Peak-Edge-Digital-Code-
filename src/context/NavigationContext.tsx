import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  MenuTemplateRecord,
  HeaderMenuConfig,
  FooterMenuConfig,
} from '../types/cms';
import { getMenuTemplates, saveMenuTemplate, DEFAULT_MENU_TEMPLATES } from '../services/cmsService';

export interface NavigationContextType {
  headerConfig: HeaderMenuConfig;
  footerConfig: FooterMenuConfig;
  activeHeaderMenu: MenuTemplateRecord | null;
  activeFooterMenu: MenuTemplateRecord | null;
  isPillExpanded: boolean;
  isMegaMenuOpen: boolean;
  isBriefDrawerOpen: boolean;
  setHeaderConfig: (config: HeaderMenuConfig | ((prev: HeaderMenuConfig) => HeaderMenuConfig)) => void;
  setFooterConfig: (config: FooterMenuConfig | ((prev: FooterMenuConfig) => FooterMenuConfig)) => void;
  setIsPillExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  setIsMegaMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setIsBriefDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  togglePillExpanded: () => void;
  toggleMegaMenu: () => void;
  toggleBriefDrawer: () => void;
  closeAllOverlays: () => void;
  refreshMenus: () => Promise<void>;
  updateAndBroadcastMenu: (menu: MenuTemplateRecord) => Promise<void>;
}

const defaultHeaderTemplate = DEFAULT_MENU_TEMPLATES.find((m) => m.type === 'header' && m.status === 'Active') || DEFAULT_MENU_TEMPLATES[0];
const defaultFooterTemplate = DEFAULT_MENU_TEMPLATES.find((m) => m.type === 'footer' && m.status === 'Active') || DEFAULT_MENU_TEMPLATES[2];

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [activeHeaderMenu, setActiveHeaderMenu] = useState<MenuTemplateRecord | null>(defaultHeaderTemplate);
  const [activeFooterMenu, setActiveFooterMenu] = useState<MenuTemplateRecord | null>(defaultFooterTemplate);

  const [headerConfig, setHeaderConfig] = useState<HeaderMenuConfig>(
    defaultHeaderTemplate.headerConfig || {}
  );
  const [footerConfig, setFooterConfig] = useState<FooterMenuConfig>(
    defaultFooterTemplate.footerConfig || {}
  );

  const [isPillExpanded, setIsPillExpanded] = useState<boolean>(
    defaultHeaderTemplate.headerConfig?.pillState !== 'collapsed'
  );
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);
  const [isBriefDrawerOpen, setIsBriefDrawerOpen] = useState<boolean>(false);

  // Sync menu templates from persistence
  const syncFromStorage = async () => {
    try {
      const templates = await getMenuTemplates();
      const activeH = templates.find((m) => m.type === 'header' && m.status === 'Active') || templates.find((m) => m.type === 'header');
      const activeF = templates.find((m) => m.type === 'footer' && m.status === 'Active') || templates.find((m) => m.type === 'footer');

      if (activeH) {
        setActiveHeaderMenu(activeH);
        if (activeH.headerConfig) {
          setHeaderConfig(activeH.headerConfig);
          if (activeH.headerConfig.pillState) {
            setIsPillExpanded(activeH.headerConfig.pillState === 'expanded');
          }
        }
      }

      if (activeF) {
        setActiveFooterMenu(activeF);
        if (activeF.footerConfig) {
          setFooterConfig(activeF.footerConfig);
        }
      }
    } catch (err) {
      console.warn('Navigation state sync notice:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    syncFromStorage();

    // Listen to real-time custom event emitted when Admin Dashboard saves a menu template
    const handleMenuEvent = (e: CustomEvent<MenuTemplateRecord>) => {
      const menu = e.detail;
      if (!menu) return;

      if (menu.type === 'header') {
        setActiveHeaderMenu(menu);
        if (menu.headerConfig) {
          setHeaderConfig({ ...menu.headerConfig });
          if (menu.headerConfig.pillState) {
            setIsPillExpanded(menu.headerConfig.pillState === 'expanded');
          }
        }
      } else if (menu.type === 'footer') {
        setActiveFooterMenu(menu);
        if (menu.footerConfig) {
          setFooterConfig({ ...menu.footerConfig });
        }
      }
    };

    // Cross-tab storage change listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'orbit_cms_menus') {
        syncFromStorage();
      }
    };

    window.addEventListener('orbit-cms-menu-update', handleMenuEvent as EventListener);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('orbit-cms-menu-update', handleMenuEvent as EventListener);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const togglePillExpanded = () => setIsPillExpanded((prev) => !prev);

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen((prev) => {
      const next = !prev;
      if (next) setIsBriefDrawerOpen(false);
      return next;
    });
  };

  const toggleBriefDrawer = () => {
    setIsBriefDrawerOpen((prev) => {
      const next = !prev;
      if (next) setIsMegaMenuOpen(false);
      return next;
    });
  };

  const closeAllOverlays = () => {
    setIsMegaMenuOpen(false);
    setIsBriefDrawerOpen(false);
  };

  const updateAndBroadcastMenu = async (menu: MenuTemplateRecord) => {
    await saveMenuTemplate(menu);
    if (menu.type === 'header') {
      setActiveHeaderMenu(menu);
      if (menu.headerConfig) setHeaderConfig(menu.headerConfig);
    } else {
      setActiveFooterMenu(menu);
      if (menu.footerConfig) setFooterConfig(menu.footerConfig);
    }
    window.dispatchEvent(new CustomEvent('orbit-cms-menu-update', { detail: menu }));
  };

  return (
    <NavigationContext.Provider
      value={{
        headerConfig,
        footerConfig,
        activeHeaderMenu,
        activeFooterMenu,
        isPillExpanded,
        isMegaMenuOpen,
        isBriefDrawerOpen,
        setHeaderConfig,
        setFooterConfig,
        setIsPillExpanded,
        setIsMegaMenuOpen,
        setIsBriefDrawerOpen,
        togglePillExpanded,
        toggleMegaMenu,
        toggleBriefDrawer,
        closeAllOverlays,
        refreshMenus: syncFromStorage,
        updateAndBroadcastMenu,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
