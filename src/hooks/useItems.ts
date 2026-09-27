// src/hooks/useItems.ts
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchInstruments,
  fetchInstrumentById,
  createInstrumentApi,
  updateInstrumentApi,
} from '../services/api';
import { Instrument, CreateInstrumentInput, UpdateItemPayload } from '../types';

export const ASYNC_STORAGE_ITEMS_KEY = '@music_school_items_offline_cache';

/**
 * Hook para listar todos los instrumentos con persistencia offline en AsyncStorage:
 * 1. Petición de red exitosa: almacena una copia síncrona en AsyncStorage.
 * 2. Petición de red fallida: captura el error y recupera los datos de la caché local de AsyncStorage.
 * 3. Provee la bandera `isOffline` para alertar en la UI cuando se esté navegando sin conexión.
 */
export const useItems = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const query = useQuery<Instrument[], Error>({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        const networkData = await fetchInstruments();
        // Guardar copia fresca en AsyncStorage
        await AsyncStorage.setItem(
          ASYNC_STORAGE_ITEMS_KEY,
          JSON.stringify(networkData)
        );
        setIsOffline(false);
        return networkData;
      } catch (networkError) {
        console.warn('Fallo de red en useItems, intentando recuperar desde AsyncStorage:', networkError);
        // Fallback a la caché offline de AsyncStorage
        const cachedJson = await AsyncStorage.getItem(ASYNC_STORAGE_ITEMS_KEY);
        if (cachedJson) {
          try {
            const parsed: Instrument[] = JSON.parse(cachedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setIsOffline(true);
              return parsed;
            }
          } catch (parseError) {
            console.error('Error parseando caché de AsyncStorage:', parseError);
          }
        }
        // Si no hay datos en caché local, se relanza el error de red original
        setIsOffline(false);
        throw networkError instanceof Error
          ? networkError
          : new Error('Error al conectar con la API y no hay datos offline.');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de vigencia en caché de TanStack Query
  });

  return {
    ...query,
    isOffline,
  };
};

/**
 * Hook para consultar un instrumento individual por su ID.
 */
export const useItemById = (id?: string) => {
  return useQuery<Instrument, Error>({
    queryKey: ['items', id],
    queryFn: () => {
      if (!id) {
        throw new Error('ID no proporcionado');
      }
      return fetchInstrumentById(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para registrar un nuevo instrumento mediante POST con Axios.
 * Invalida la query de TanStack Query y actualiza preventivamente la caché de AsyncStorage.
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation<Instrument, Error, CreateInstrumentInput>({
    mutationFn: (input: CreateInstrumentInput) => createInstrumentApi(input),
    onSuccess: async (newItem) => {
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      try {
        const cached = await AsyncStorage.getItem(ASYNC_STORAGE_ITEMS_KEY);
        if (cached) {
          const list: Instrument[] = JSON.parse(cached);
          const updated = [newItem, ...list];
          await AsyncStorage.setItem(ASYNC_STORAGE_ITEMS_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('No se pudo actualizar AsyncStorage tras creación:', err);
      }
    },
  });
};

/**
 * Hook para actualizar un instrumento existente mediante PUT/PATCH con Axios.
 * Invalida la query y sincroniza la copia local en AsyncStorage.
 */
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Instrument,
    Error,
    { id: string; data: UpdateItemPayload }
  >({
    mutationFn: ({ id, data }) => updateInstrumentApi(id, data),
    onSuccess: async (updatedInstrument, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      await queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
      try {
        const cached = await AsyncStorage.getItem(ASYNC_STORAGE_ITEMS_KEY);
        if (cached) {
          const list: Instrument[] = JSON.parse(cached);
          const updated = list.map((item) =>
            item.id === variables.id ? { ...item, ...updatedInstrument } : item
          );
          await AsyncStorage.setItem(ASYNC_STORAGE_ITEMS_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('No se pudo actualizar AsyncStorage tras edición:', err);
      }
    },
  });
};
