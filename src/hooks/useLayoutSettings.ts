import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'squirbert-layout-settings';

interface LayoutSettings {
  arenaScale: number;
  arenaOffsetX: number;
  arenaOffsetY: number;
  hudScale: number;
  hudOffsetX: number;
  hudOffsetY: number;
}

const DEFAULT_SETTINGS: LayoutSettings = {
  arenaScale: 0.78,
  arenaOffsetX: 0,
  arenaOffsetY: 0,
  hudScale: 1,
  hudOffsetX: 8,
  hudOffsetY: 8,
};

const loadSettings = (): LayoutSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load layout settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const useLayoutSettings = () => {
  const [settings, setSettings] = useState<LayoutSettings>(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save layout settings:', e);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    ...settings,
    setArenaScale: (v: number) => updateSetting('arenaScale', v),
    setArenaOffsetX: (v: number) => updateSetting('arenaOffsetX', v),
    setArenaOffsetY: (v: number) => updateSetting('arenaOffsetY', v),
    setHudScale: (v: number) => updateSetting('hudScale', v),
    setHudOffsetX: (v: number) => updateSetting('hudOffsetX', v),
    setHudOffsetY: (v: number) => updateSetting('hudOffsetY', v),
    resetSettings,
  };
};
