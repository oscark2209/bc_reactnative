// src/hooks/usePreferences.ts
import { useMMKVString, useMMKVBoolean, useMMKVNumber, storage } from '../storage/mmkv';

export type SortOrder = 'name' | 'category';

export interface PreferencesHookResult {
  sortOrder: SortOrder;
  setSortOrder: (newOrder: SortOrder) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  toggleCompactMode: () => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  resetPreferences: () => void;
}

/**
 * Hook reactivo para preferencias de usuario utilizando MMKV.
 * Proporciona lectura y escritura síncrona sin latencia de async/await.
 * Cualquier cambio se propaga instantáneamente a los componentes que lo consuman.
 */
export function usePreferences(): PreferencesHookResult {
  // 1. Criterio de ordenación en el catálogo ('name' | 'category')
  const [sortOrderRaw, setSortOrderRaw] = useMMKVString('pref_sort_order', storage);

  // 2. Modo compacto para la densidad visual de las tarjetas
  const [compactModeRaw, setCompactModeRaw] = useMMKVBoolean('pref_compact_mode', storage);

  // 3. Cantidad de elementos por página / lote en la vista
  const [itemsPerPageRaw, setItemsPerPageRaw] = useMMKVNumber('pref_items_per_page', storage);

  const sortOrder: SortOrder = sortOrderRaw === 'category' ? 'category' : 'name';
  const compactMode: boolean = compactModeRaw ?? false;
  const itemsPerPage: number = itemsPerPageRaw ?? 10;

  const setSortOrder = (newOrder: SortOrder) => {
    setSortOrderRaw(newOrder);
  };

  const setCompactMode = (value: boolean) => {
    setCompactModeRaw(value);
  };

  const toggleCompactMode = () => {
    setCompactModeRaw(!compactMode);
  };

  const setItemsPerPage = (count: number) => {
    setItemsPerPageRaw(count);
  };

  const resetPreferences = () => {
    setSortOrderRaw('name');
    setCompactModeRaw(false);
    setItemsPerPageRaw(10);
  };

  return {
    sortOrder,
    setSortOrder,
    compactMode,
    setCompactMode,
    toggleCompactMode,
    itemsPerPage,
    setItemsPerPage,
    resetPreferences,
  };
}
