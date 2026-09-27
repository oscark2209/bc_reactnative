// src/services/tokenService.ts
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'music_school_access_token';
const REFRESH_TOKEN_KEY = 'music_school_refresh_token';

// Fallback en memoria si SecureStore no está disponible (ej. navegador web)
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

async function isSecureAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Obtiene el access token JWT guardado en SecureStore.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    if (await isSecureAvailable()) {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
    return memoryAccessToken;
  } catch (error) {
    console.error('Error leyendo accessToken de SecureStore:', error);
    return memoryAccessToken;
  }
}

/**
 * Guarda el access token en SecureStore.
 */
export async function setAccessToken(token: string): Promise<void> {
  try {
    if (await isSecureAvailable()) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    }
    memoryAccessToken = token;
  } catch (error) {
    console.error('Error guardando accessToken en SecureStore:', error);
    memoryAccessToken = token;
  }
}

/**
 * Obtiene el refresh token guardado en SecureStore.
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (await isSecureAvailable()) {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
    return memoryRefreshToken;
  } catch (error) {
    console.error('Error leyendo refreshToken de SecureStore:', error);
    return memoryRefreshToken;
  }
}

/**
 * Guarda el refresh token en SecureStore.
 */
export async function setRefreshToken(token: string): Promise<void> {
  try {
    if (await isSecureAvailable()) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
    memoryRefreshToken = token;
  } catch (error) {
    console.error('Error guardando refreshToken en SecureStore:', error);
    memoryRefreshToken = token;
  }
}

/**
 * Almacena el par de tokens (access y refresh) en SecureStore de forma atómica.
 */
export async function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  await Promise.all([
    setAccessToken(tokens.accessToken),
    setRefreshToken(tokens.refreshToken),
  ]);
}

/**
 * Elimina ambos tokens de SecureStore (cerrar sesión).
 */
export async function clearTokens(): Promise<void> {
  try {
    if (await isSecureAvailable()) {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    }
  } catch (error) {
    console.error('Error eliminando tokens de SecureStore:', error);
  } finally {
    memoryAccessToken = null;
    memoryRefreshToken = null;
  }
}
