// src/storage/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export const SECURE_KEYS = {
  ADMIN_PASSKEY: 'music_school_admin_passkey',
  SESSION_TOKEN: 'music_school_session_token',
} as const;

export interface SecureVerifyResult {
  isConfigured: boolean;
  maskedValue?: string;
  length?: number;
}

/**
 * Guarda un dato sensible en el almacenamiento cifrado por hardware (Keychain/Keystore).
 */
export async function saveSecureItem(key: string, value: string): Promise<boolean> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      console.warn('SecureStore no está disponible en esta plataforma (ej. Web)');
      return false;
    }
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    console.error('Error guardando en SecureStore:', error);
    return false;
  }
}

/**
 * Verifica si existe un dato sensible y retorna una versión enmascarada sin exponer el texto plano.
 */
export async function verifySecureItem(key: string): Promise<SecureVerifyResult> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      return { isConfigured: false };
    }

    const value = await SecureStore.getItemAsync(key);
    if (!value) {
      return { isConfigured: false };
    }

    // Enmascaramiento seguro: NUNCA retornar el valor en texto plano
    const masked = '•'.repeat(Math.min(value.length, 12));
    return {
      isConfigured: true,
      maskedValue: masked,
      length: value.length,
    };
  } catch (error) {
    console.error('Error verificando SecureStore:', error);
    return { isConfigured: false };
  }
}

/**
 * Elimina de forma segura un dato del llavero cifrado.
 */
export async function deleteSecureItem(key: string): Promise<boolean> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    console.error('Error eliminando de SecureStore:', error);
    return false;
  }
}
