import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { preferences as preferencesApi } from '../api/client';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

const defaultPreferences = {
  feedMode: 'following',
  interests: [],
  showTrending: true,
  compactFeed: false,
  notifyMessages: true,
};

export function PreferencesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) {
      setPrefs(defaultPreferences);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await preferencesApi.get();
      setPrefs(data);
    } catch {
      setPrefs(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  async function updatePreferences(updates) {
    const data = await preferencesApi.update(updates);
    setPrefs(data);
    return data;
  }

  return (
    <PreferencesContext.Provider value={{ prefs, loading, updatePreferences, reload: loadPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
