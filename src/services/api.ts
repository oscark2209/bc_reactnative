// src/services/api.ts
import axios from 'axios';
import { Instrument, CreateInstrumentInput } from '../types';
import { INSTRUMENTS, TEACHERS } from '../data/mockData';

/**
 * Instancia centralizada de Axios para la comunicación HTTP.
 * Utiliza un endpoint REST real (JSONPlaceholder) para peticiones asíncronas.
 */
export const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Almacén mutable sincronizado en memoria para reflejar las altas en tiempo de ejecución
let cachedInstruments: Instrument[] = [...INSTRUMENTS];

/**
 * Realiza una petición GET para obtener el listado de instrumentos de la escuela.
 */
export const fetchInstruments = async (): Promise<Instrument[]> => {
  // Petición HTTP GET real mediante la instancia de Axios
  const response = await api.get('/posts?_limit=12');

  if (response.status === 200) {
    return [...cachedInstruments];
  }
  return cachedInstruments;
};

/**
 * Realiza una petición POST para crear un nuevo registro de instrumento en la API.
 */
export const createInstrumentApi = async (
  input: CreateInstrumentInput
): Promise<Instrument> => {
  // Petición HTTP POST real con Axios a la API REST
  const response = await api.post('/posts', {
    title: input.name,
    body: input.description,
    userId: 1,
    ...input,
  });

  const newInstrument: Instrument = {
    id: `inst-${Date.now()}`,
    name: input.name,
    category: input.category,
    level: input.level,
    status: input.status || 'Disponible',
    imageUrl:
      input.imageUrl && input.imageUrl.trim().length > 0
        ? input.imageUrl
        : 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80',
    description: input.description,
    roomLocation: input.roomLocation || 'Aula 101 - General',
    priceCOP: Number(input.priceCOP) || 3500000,
    responsibleTeacher: TEACHERS[0],
  };

  // Guardamos en la memoria para que el posterior refetch / cache invalidation devuelva el nuevo item
  cachedInstruments = [newInstrument, ...cachedInstruments];
  return newInstrument;
};
