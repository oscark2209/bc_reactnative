// src/hooks/useItems.ts
import { useQuery } from '@tanstack/react-query';
import { fetchInstruments } from '../services/api';
import { Instrument } from '../types';

/**
 * Hook personalizado que encapsula useQuery de TanStack Query v5
 * para el consumo asíncrono y en caché del inventario de instrumentos.
 */
export const useItems = () => {
  return useQuery<Instrument[], Error>({
    queryKey: ['items'],
    queryFn: fetchInstruments,
    staleTime: 1000 * 60 * 5, // 5 minutos de frescura en caché
  });
};
