// src/hooks/useItems.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInstruments,
  fetchInstrumentById,
  createInstrumentApi,
  updateInstrumentApi,
} from '../services/api';
import { Instrument, CreateInstrumentInput, UpdateItemPayload } from '../types';

/**
 * Hook para listar todos los instrumentos de la escuela.
 */
export const useItems = () => {
  return useQuery<Instrument[], Error>({
    queryKey: ['items'],
    queryFn: fetchInstruments,
    staleTime: 1000 * 60 * 5,
  });
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
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation<Instrument, Error, CreateInstrumentInput>({
    mutationFn: (input: CreateInstrumentInput) => createInstrumentApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

/**
 * Hook para actualizar un instrumento existente mediante PUT/PATCH con Axios.
 */
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Instrument,
    Error,
    { id: string; data: UpdateItemPayload }
  >({
    mutationFn: ({ id, data }) => updateInstrumentApi(id, data),
    onSuccess: (_updatedInstrument, variables) => {
      // Invalida la lista general y la query individual del item editado
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', variables.id] });
    },
  });
};
