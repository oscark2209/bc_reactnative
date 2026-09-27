// src/storage/mmkv.ts
import { useCallback, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MMKV {
  id: string;
  set(key: string, value: string | number | boolean): void;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  contains(key: string): boolean;
  remove(key: string): boolean;
  delete(key: string): boolean;
  clearAll(): void;
  getAllKeys(): string[];
  addOnValueChangedListener(listener: (key: string) => void): { remove: () => void };
}

/**
 * Almacén síncrono en memoria para MMKV con soporte total para Expo Go.
 * Evita la dependencia de C++ TurboModules (NitroModules) que colapsa en Expo Go,
 * mientras proporciona acceso síncrono instantáneo y reactividad con useSyncExternalStore.
 */
const memoryStore = new Map<string, string | number | boolean>();
const listeners = new Set<(key: string) => void>();

const ASYNC_PREFIX = '@mmkv_sync_';

// Pre-cargar valores almacenados previamente para que sobrevivan reinicios en Expo Go
AsyncStorage.getAllKeys().then(async (keys) => {
  const mmkvKeys = keys.filter((k) => k.startsWith(ASYNC_PREFIX));
  if (mmkvKeys.length > 0) {
    const pairs = await AsyncStorage.multiGet(mmkvKeys);
    pairs.forEach(([fullKey, val]) => {
      if (val !== null) {
        const rawKey = fullKey.replace(ASYNC_PREFIX, '');
        // Restaurar según tipo inferido
        if (val === 'true') memoryStore.set(rawKey, true);
        else if (val === 'false') memoryStore.set(rawKey, false);
        else if (!isNaN(Number(val)) && val.trim() !== '') memoryStore.set(rawKey, Number(val));
        else memoryStore.set(rawKey, val);
        listeners.forEach((l) => l(rawKey));
      }
    });
  }
}).catch(() => {});

function notifyListeners(key: string) {
  listeners.forEach((listener) => {
    try {
      listener(key);
    } catch {}
  });
}

/**
 * Instancia global de MMKV
 */
export const storage: MMKV = {
  id: 'music-school-preferences',
  set: (key: string, value: string | number | boolean) => {
    memoryStore.set(key, value);
    notifyListeners(key);
    // Sincronización asíncrona en segundo plano sin bloquear el hilo principal
    AsyncStorage.setItem(`${ASYNC_PREFIX}${key}`, String(value)).catch(() => {});
  },
  getString: (key: string) => {
    const v = memoryStore.get(key);
    return typeof v === 'string' ? v : undefined;
  },
  getNumber: (key: string) => {
    const v = memoryStore.get(key);
    return typeof v === 'number' ? v : undefined;
  },
  getBoolean: (key: string) => {
    const v = memoryStore.get(key);
    return typeof v === 'boolean' ? v : undefined;
  },
  contains: (key: string) => memoryStore.has(key),
  remove: (key: string) => {
    const deleted = memoryStore.delete(key);
    if (deleted) {
      notifyListeners(key);
      AsyncStorage.removeItem(`${ASYNC_PREFIX}${key}`).catch(() => {});
    }
    return deleted;
  },
  delete: (key: string) => {
    const deleted = memoryStore.delete(key);
    if (deleted) {
      notifyListeners(key);
      AsyncStorage.removeItem(`${ASYNC_PREFIX}${key}`).catch(() => {});
    }
    return deleted;
  },
  clearAll: () => {
    const keys = Array.from(memoryStore.keys());
    memoryStore.clear();
    keys.forEach((k) => notifyListeners(k));
    AsyncStorage.multiRemove(keys.map((k) => `${ASYNC_PREFIX}${k}`)).catch(() => {});
  },
  getAllKeys: () => Array.from(memoryStore.keys()),
  addOnValueChangedListener: (listener: (key: string) => void) => {
    listeners.add(listener);
    return {
      remove: () => listeners.delete(listener),
    };
  },
};

/**
 * Fábrica de hooks reactivos utilizando useSyncExternalStore (idéntico a react-native-mmkv)
 */
function createMMKVHook<T>(getter: (inst: MMKV, key: string) => T | undefined) {
  return (
    key: string,
    instance?: MMKV
  ): [T | undefined, (value: T | ((current: T | undefined) => T | undefined) | undefined) => void] => {
    const mmkv = instance ?? storage;

    const value = useSyncExternalStore(
      useCallback(
        (onStoreChange) => {
          const sub = mmkv.addOnValueChangedListener((changedKey) => {
            if (changedKey === key) {
              onStoreChange();
            }
          });
          return () => sub.remove();
        },
        [key, mmkv]
      ),
      useCallback(() => getter(mmkv, key), [key, mmkv])
    );

    const setValue = useCallback(
      (v: T | ((current: T | undefined) => T | undefined) | undefined) => {
        const currentValue = getter(mmkv, key);
        const resolved = typeof v === 'function' ? (v as (c: T | undefined) => T | undefined)(currentValue) : v;

        if (resolved === undefined) {
          mmkv.remove(key);
        } else if (
          typeof resolved === 'string' ||
          typeof resolved === 'number' ||
          typeof resolved === 'boolean'
        ) {
          mmkv.set(key, resolved);
        }
      },
      [key, mmkv]
    );

    return [value, setValue];
  };
}

export const useMMKVString = createMMKVHook<string>((inst, key) => inst.getString(key));
export const useMMKVBoolean = createMMKVHook<boolean>((inst, key) => inst.getBoolean(key));
export const useMMKVNumber = createMMKVHook<number>((inst, key) => inst.getNumber(key));
