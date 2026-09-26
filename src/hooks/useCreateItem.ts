// src/hooks/useCreateItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInstrumentApi } from '../services/api';
import { CreateInstrumentInput, Instrument } from '../types';

/**
 * Hook personalizado que encapsula useMutation de TanStack Query v5
 * para el alta de nuevos instrumentos mediante POST con Axios.
 * Al completarse exitosamente, invalida la caché de 'items' para sincronizar la lista.
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation<Instrument, Error, CreateInstrumentInput>({
    mutationFn: (input: CreateInstrumentInput) => createInstrumentApi(input),
    onSuccess: () => {
      // Invalidación automática de la caché de la lista de items
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
