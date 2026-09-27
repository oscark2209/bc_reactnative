// src/stores/savedStore.ts
import { create } from 'zustand';
import { Instrument } from '../types';

/**
 * Interface estricta para el estado global de elementos guardados con Zustand.
 */
export interface SavedState {
  savedItems: Instrument[];
  addItem: (instrument: Instrument) => void;
  removeItem: (id: string) => void;
  toggleItem: (instrument: Instrument) => void;
  clearAll: () => void;
  isSaved: (id: string) => boolean;
}

/**
 * Store de Zustand para la gestión de instrumentos guardados / favoritos.
 * Implementa mutaciones inmutables y funciones selectoras para evitar renders innecesarios.
 */
export const useSavedStore = create<SavedState>()((set, get) => ({
  savedItems: [],

  /**
   * Agrega un instrumento a la lista si no se encuentra previamente guardado.
   */
  addItem: (instrument: Instrument) => {
    const { savedItems } = get();
    const alreadySaved = savedItems.some((item) => item.id === instrument.id);
    if (!alreadySaved) {
      set({ savedItems: [instrument, ...savedItems] });
    }
  },

  /**
   * Elimina un instrumento de la lista utilizando su ID único.
   */
  removeItem: (id: string) => {
    set((state) => ({
      savedItems: state.savedItems.filter((item) => item.id !== id),
    }));
  },

  /**
   * Alterna el estado de guardado (si existe lo elimina, si no existe lo agrega).
   */
  toggleItem: (instrument: Instrument) => {
    const { savedItems } = get();
    const exists = savedItems.some((item) => item.id === instrument.id);
    if (exists) {
      set({
        savedItems: savedItems.filter((item) => item.id !== instrument.id),
      });
    } else {
      set({
        savedItems: [instrument, ...savedItems],
      });
    }
  },

  /**
   * Limpia por completo la lista de instrumentos guardados.
   */
  clearAll: () => {
    set({ savedItems: [] });
  },

  /**
   * Determina si un instrumento ya está guardado en el estado global.
   */
  isSaved: (id: string) => {
    return get().savedItems.some((item) => item.id === id);
  },
}));
