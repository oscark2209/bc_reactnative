// src/screens/SettingsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferences, SortOrder } from '../hooks/usePreferences';
import {
  saveSecureItem,
  verifySecureItem,
  deleteSecureItem,
  SECURE_KEYS,
  SecureVerifyResult,
} from '../storage/secureStore';
import { ASYNC_STORAGE_ITEMS_KEY } from '../hooks/useItems';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';

export const SettingsScreen: React.FC = () => {
  // 1. Consumo del hook reactivo de MMKV (Síncrono)
  const {
    sortOrder,
    setSortOrder,
    compactMode,
    toggleCompactMode,
    itemsPerPage,
    setItemsPerPage,
    resetPreferences,
  } = usePreferences();

  // 2. Estado local para manejo de Expo SecureStore
  const [passkeyInput, setPasskeyInput] = useState('');
  const [secureStatus, setSecureStatus] = useState<SecureVerifyResult>({ isConfigured: false });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingSecure, setIsSavingSecure] = useState(false);

  // 3. Estado local para inspección de AsyncStorage
  const [cachedItemsCount, setCachedItemsCount] = useState<number | null>(null);

  // Verificar estado de la llave en SecureStore al montar
  const checkSecureKeyStatus = useCallback(async () => {
    setIsVerifying(true);
    try {
      const result = await verifySecureItem(SECURE_KEYS.ADMIN_PASSKEY);
      setSecureStatus(result);
    } catch {
      setSecureStatus({ isConfigured: false });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Verificar tamaño de la caché de AsyncStorage
  const checkAsyncStorageCache = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(ASYNC_STORAGE_ITEMS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setCachedItemsCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setCachedItemsCount(0);
      }
    } catch {
      setCachedItemsCount(0);
    }
  }, []);

  useEffect(() => {
    checkSecureKeyStatus();
    checkAsyncStorageCache();
  }, [checkSecureKeyStatus, checkAsyncStorageCache]);

  // Guardar en SecureStore
  const handleSavePasskey = async () => {
    const trimmed = passkeyInput.trim();
    if (!trimmed) {
      Alert.alert('Campo Requerido', 'Por favor ingresa un código de acceso para la escuela.');
      return;
    }
    if (trimmed.length < 4) {
      Alert.alert('Seguridad Insuficiente', 'El código de acceso debe tener al menos 4 caracteres.');
      return;
    }

    setIsSavingSecure(true);
    const success = await saveSecureItem(SECURE_KEYS.ADMIN_PASSKEY, trimmed);
    setIsSavingSecure(false);

    if (success) {
      setPasskeyInput('');
      await checkSecureKeyStatus();
      Alert.alert(
        '🔐 Almacenamiento Seguro Exitoso',
        'El código de acceso fue cifrado y almacenado en el llavero de hardware (SecureStore). NUNCA se expondrá en texto plano.'
      );
    } else {
      Alert.alert('Error', 'No se pudo guardar la clave en SecureStore.');
    }
  };

  // Eliminar de SecureStore
  const handleDeletePasskey = () => {
    Alert.alert(
      'Eliminar Llave Segura',
      '¿Estás seguro de que deseas revocar y eliminar la clave de administración cifrada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSecureItem(SECURE_KEYS.ADMIN_PASSKEY);
            if (success) {
              await checkSecureKeyStatus();
              Alert.alert('Revocada', 'La llave fue eliminada del hardware de forma segura.');
            }
          },
        },
      ]
    );
  };

  // Limpiar caché de AsyncStorage
  const handleClearAsyncStorage = () => {
    Alert.alert(
      'Limpiar Caché Offline',
      '¿Deseas vaciar la copia local offline guardada en AsyncStorage?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(ASYNC_STORAGE_ITEMS_KEY);
            await checkAsyncStorageCache();
            Alert.alert('Caché Vaciada', 'Los datos offline de AsyncStorage fueron eliminados.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner Informativo Semana 07 */}
        <View style={styles.banner}>
          <View style={styles.bannerTag}>
            <Ionicons name="hardware-chip-outline" size={14} color={COLORS.primaryLight} />
            <Text style={styles.bannerTagText}>SEMANA 07 — PERSISTENCIA LOCAL</Text>
          </View>
          <Text style={styles.bannerTitle}>Gestión de Almacenamiento</Text>
          <Text style={styles.bannerSubtitle}>
            Uso síncrono de MMKV para UI, AsyncStorage para caché offline y Expo SecureStore para credenciales sensibles.
          </Text>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 1: PREFERENCIAS SÍNCRONAS CON MMKV              */}
        {/* ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircleMMKV}>
              <Ionicons name="flash-outline" size={18} color="#38BDF8" />
            </View>
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle}>Preferencias Síncronas (MMKV)</Text>
              <Text style={styles.sectionSubtitle}>
                Lectura y escritura instantánea en memoria sin bloqueos async
              </Text>
            </View>
          </View>

          {/* 1.1 Orden de la Lista */}
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>Criterio de Orden en Catálogo</Text>
            <View style={styles.sortButtonGroup}>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'name' && styles.sortButtonActive]}
                onPress={() => setSortOrder('name')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="text-outline"
                  size={16}
                  color={sortOrder === 'name' ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOrder === 'name' && styles.sortButtonTextActive,
                  ]}
                >
                  Por Nombre (A-Z)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'category' && styles.sortButtonActive]}
                onPress={() => setSortOrder('category')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="albums-outline"
                  size={16}
                  color={sortOrder === 'category' ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOrder === 'category' && styles.sortButtonTextActive,
                  ]}
                >
                  Por Categoría
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 1.2 Modo Compacto */}
          <View style={styles.divider} />
          <View style={styles.settingRowBetween}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Modo Compacto de Tarjetas</Text>
              <Text style={styles.settingDescription}>
                Reduce la altura visual de las tarjetas para mostrar más instrumentos en pantalla.
              </Text>
            </View>
            <Switch
              value={compactMode}
              onValueChange={toggleCompactMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.textInverse}
            />
          </View>

          {/* 1.3 Ítems por Página */}
          <View style={styles.divider} />
          <View style={styles.settingBlock}>
            <View style={styles.settingRowBetween}>
              <Text style={styles.settingLabel}>Densidad de Ítems por Lote</Text>
              <Text style={styles.settingBadgeValue}>{itemsPerPage} ítems</Text>
            </View>
            <View style={styles.chipsRow}>
              {[5, 10, 15, 20].map((num) => {
                const isSelected = itemsPerPage === num;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setItemsPerPage(num)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {num} ítems
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Botón Restablecer MMKV */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetPreferences}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-circle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.resetButtonText}>Restablecer Valores Predeterminados (MMKV)</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 2: DATO SENSIBLE CON EXPO SECURESTORE           */}
        {/* ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircleSecure}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
            </View>
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle}>Seguridad (Expo SecureStore)</Text>
              <Text style={styles.sectionSubtitle}>
                Cifrado por hardware en iOS Keychain o Android Keystore
              </Text>
            </View>
          </View>

          {/* Estado de la Llave */}
          <View style={styles.secureStatusBox}>
            <View style={styles.secureStatusHeader}>
              <Text style={styles.secureStatusLabel}>Estado del Código de Administración:</Text>
              {isVerifying ? (
                <ActivityIndicator size="small" color={COLORS.primaryLight} />
              ) : secureStatus.isConfigured ? (
                <View style={styles.statusBadgeConfigured}>
                  <Ionicons name="lock-closed" size={12} color="#10B981" />
                  <Text style={styles.statusBadgeTextConfigured}>Cifrada y Activa</Text>
                </View>
              ) : (
                <View style={styles.statusBadgeEmpty}>
                  <Ionicons name="lock-open-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.statusBadgeTextEmpty}>No Configurada</Text>
                </View>
              )}
            </View>

            {secureStatus.isConfigured ? (
              <View style={styles.maskedKeyWrapper}>
                <Text style={styles.maskedKeyText}>
                  Valor Cifrado: <Text style={styles.maskedKeyDots}>{secureStatus.maskedValue}</Text>
                </Text>
                <Text style={styles.maskedKeyHint}>
                  (Protección activa: El texto plano nunca se expone en la interfaz)
                </Text>
              </View>
            ) : (
              <Text style={styles.secureStatusEmptyText}>
                No hay un código de acceso registrado en el llavero de hardware.
              </Text>
            )}
          </View>

          {/* Formulario de Entrada Segura */}
          <View style={styles.settingBlock}>
            <Text style={styles.settingLabel}>
              {secureStatus.isConfigured ? 'Actualizar Código de Acceso' : 'Nuevo Código de Acceso'}
            </Text>
            <TextInput
              style={styles.secureInput}
              placeholder="••••••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={passkeyInput}
              onChangeText={setPasskeyInput}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Botones de Acción SecureStore */}
          <View style={styles.secureActionButtonsRow}>
            <TouchableOpacity
              style={[styles.saveSecureButton, isSavingSecure && styles.buttonDisabled]}
              onPress={handleSavePasskey}
              disabled={isSavingSecure}
              activeOpacity={0.8}
            >
              {isSavingSecure ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <>
                  <Ionicons name="key-outline" size={16} color={COLORS.textInverse} />
                  <Text style={styles.saveSecureButtonText}>Guardar en SecureStore</Text>
                </>
              )}
            </TouchableOpacity>

            {secureStatus.isConfigured && (
              <TouchableOpacity
                style={styles.deleteSecureButton}
                onPress={handleDeletePasskey}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.maintenanceText} />
                <Text style={styles.deleteSecureButtonText}>Revocar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ======================================================== */}
        {/* SECCIÓN 3: CACHÉ OFFLINE CON ASYNCSTORAGE               */}
        {/* ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconCircleAsync}>
              <Ionicons name="cloud-offline-outline" size={18} color="#F59E0B" />
            </View>
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle}>Caché Offline (AsyncStorage)</Text>
              <Text style={styles.sectionSubtitle}>
                Copia local para respaldo cuando falla la conexión con la API
              </Text>
            </View>
          </View>

          <View style={styles.asyncCacheInfoBox}>
            <Text style={styles.asyncCacheLabel}>Registros Guardados en Caché:</Text>
            <Text style={styles.asyncCacheValue}>
              {cachedItemsCount !== null ? `${cachedItemsCount} instrumentos` : 'Inspeccionando...'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.clearCacheButton}
            onPress={handleClearAsyncStorage}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-bin-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.clearCacheButtonText}>Vaciar Caché Offline de AsyncStorage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  banner: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 1,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
  },
  bannerTagText: {
    ...TYPOGRAPHY.headerTag,
    color: COLORS.badgeCategoryText,
  },
  bannerTitle: {
    ...TYPOGRAPHY.headerTitle,
    fontSize: 20,
  },
  bannerSubtitle: {
    ...TYPOGRAPHY.headerSubtitle,
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircleMMKV: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSecure: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleAsync: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleWrapper: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  settingBlock: {
    gap: SPACING.xs,
  },
  settingRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
    gap: SPACING.xs - 2,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  settingBadgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  sortButtonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sortButtonTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chip: {
    flex: 1,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
  },
  resetButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  secureStatusBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  secureStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureStatusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadgeConfigured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  statusBadgeTextConfigured: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
  },
  statusBadgeEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  statusBadgeTextEmpty: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  maskedKeyWrapper: {
    marginTop: SPACING.xs,
    gap: 2,
  },
  maskedKeyText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  maskedKeyDots: {
    color: COLORS.primaryLight,
    letterSpacing: 2,
  },
  maskedKeyHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  secureStatusEmptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  secureInput: {
    height: 44,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  secureActionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  saveSecureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    height: 44,
    backgroundColor: COLORS.availableBg,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.available,
  },
  saveSecureButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.availableText,
  },
  deleteSecureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 44,
    backgroundColor: COLORS.maintenanceBg,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.maintenance,
  },
  deleteSecureButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.maintenanceText,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  asyncCacheInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  asyncCacheLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  asyncCacheValue: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  clearCacheButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
