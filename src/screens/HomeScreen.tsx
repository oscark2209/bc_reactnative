// src/screens/HomeScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Instrument } from '../types';
import { ItemCard } from '../components/ItemCard';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';
import { HomeScreenProps } from '../navigation/types';
import { useSavedStore } from '../stores/savedStore';
import { useAuthStore } from '../stores/authStore';
import { useItems } from '../hooks/useItems';
import { usePreferences } from '../hooks/usePreferences';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((state) => state.user);

  // 1. Consumo de TanStack Query v5 para datos en red y fallback offline (AsyncStorage)
  const { data, isLoading, isError, error, refetch, isFetching, isOffline } = useItems();
  const instruments = data || [];

  // 2. Preferencias síncronas de MMKV (criterio de orden y modo compacto)
  const { sortOrder, compactMode, toggleCompactMode } = usePreferences();

  // 3. Consumo estricto del store global de Zustand con selectores específicos
  const savedItems = useSavedStore((state) => state.savedItems);
  const toggleItem = useSavedStore((state) => state.toggleItem);

  // Set optimizado para verificación O(1) de instrumentos guardados
  const savedIdsSet = useMemo(
    () => new Set(savedItems.map((item) => item.id)),
    [savedItems]
  );

  // 4. Filtrado y ordenamiento en tiempo real con useMemo respetando sortOrder de MMKV
  const processedInstruments = useMemo(() => {
    let list = instruments;
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(
        (instrument) =>
          instrument.name.toLowerCase().includes(query) ||
          instrument.category.toLowerCase().includes(query) ||
          instrument.level.toLowerCase().includes(query) ||
          instrument.roomLocation.toLowerCase().includes(query) ||
          instrument.responsibleTeacher.name.toLowerCase().includes(query)
      );
    }

    return [...list].sort((a, b) => {
      if (sortOrder === 'category') {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, instruments, sortOrder]);

  // 4. keyExtractor estrictamente basado en el id único
  const keyExtractor = useCallback((item: Instrument) => item.id, []);

  // 5. Manejo de navegación al detalle
  const handleItemPress = useCallback(
    (instrument: Instrument) => {
      navigation.navigate('Detail', { instrument });
    },
    [navigation]
  );

  // 6. Manejo de navegación al formulario de edición con Zod
  const handleEditPress = useCallback(
    (instrument: Instrument) => {
      navigation.navigate('Edit', { id: instrument.id, instrument });
    },
    [navigation]
  );

  // 7. renderItem memorizado con useCallback (soporta compactMode de MMKV)
  const renderItem: ListRenderItem<Instrument> = useCallback(
    ({ item }) => (
      <ItemCard
        item={item}
        onPress={handleItemPress}
        onEdit={handleEditPress}
        isSaved={savedIdsSet.has(item.id)}
        onToggleSave={toggleItem}
        compactMode={compactMode}
      />
    ),
    [handleItemPress, handleEditPress, savedIdsSet, toggleItem, compactMode]
  );

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // 7. Componente de estado vacío memorizado
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={44} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Sin resultados encontrados</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery
            ? `No se encontraron instrumentos que coincidan con "${searchQuery}". Intenta con otro término o categoría.`
            : 'No hay instrumentos disponibles en la API en este momento.'}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  // ==========================================
  // ESTADO DE RED: LOADING STATE (ActivityIndicator)
  // ==========================================
  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
        <Text style={styles.loadingTitle}>Conectando con la API...</Text>
        <Text style={styles.loadingSubtitle}>
          Descargando inventario musical mediante Axios y TanStack Query
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ESTADO DE RED: ERROR STATE CON BOTÓN REINTENTAR
  // ==========================================
  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top', 'left', 'right']}>
        <View style={styles.errorIconCircle}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.maintenanceText} />
        </View>
        <Text style={styles.errorTitle}>Error al Cargar Datos</Text>
        <Text style={styles.errorSubtitle}>
          {error?.message || 'Ocurrió un error al intentar comunicar con la API REST.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={18} color={COLORS.textInverse} />
          <Text style={styles.retryButtonText}>Reintentar Conexión</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Encabezado Principal con botones para crear y ajustes */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>CONSERVATORIO ACADÉMICO</Text>
            </View>
            <View style={styles.headerActionsRow}>
              <TouchableOpacity
                style={styles.settingsHeaderButton}
                onPress={() => navigation.navigate('ProfileTab')}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="person-outline" size={18} color={COLORS.primaryLight} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsHeaderButton}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="settings-outline" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('Create')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color={COLORS.textInverse} />
                <Text style={styles.createButtonText}>Nuevo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.headerTitle}>Catálogo de Instrumentos</Text>
          <Text style={styles.headerSubtitle}>
            {user
              ? `Músico: ${user.firstName} • Cátedra: ${user.instrumentSpecialty || 'Sinfónica'}`
              : 'Persistencia MMKV (UI síncrona) y respaldo offline con AsyncStorage'}
          </Text>
        </View>

        {/* Banner de Estado Offline si se están mostrando datos locales */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={20} color="#FBBF24" />
            <View style={styles.offlineBannerTextWrapper}>
              <Text style={styles.offlineBannerTitle}>⚠️ Mostrando datos sin red</Text>
              <Text style={styles.offlineBannerSubtitle}>
                Copia local recuperada automáticamente desde AsyncStorage
              </Text>
            </View>
            <TouchableOpacity
              style={styles.offlineRetryBtn}
              onPress={() => refetch()}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={13} color="#FBBF24" />
              <Text style={styles.offlineRetryText}>Reconectar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección de Búsqueda y Filtros Rápidos MMKV */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, categoría, profesor o aula..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          <View style={styles.resultsCounterRow}>
            <Text style={styles.resultsCounterText}>
              {processedInstruments.length} de {instruments.length} instrumentos
            </Text>
            <View style={styles.quickPreferencesRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={styles.prefChip}
                activeOpacity={0.8}
              >
                <Ionicons name="funnel-outline" size={11} color={COLORS.primaryLight} />
                <Text style={styles.prefChipText}>
                  {sortOrder === 'category' ? 'Categoría' : 'Nombre'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleCompactMode}
                style={[styles.prefChip, compactMode && styles.prefChipActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={compactMode ? 'grid' : 'grid-outline'}
                  size={11}
                  color={compactMode ? COLORS.textInverse : COLORS.textSecondary}
                />
                <Text
                  style={[styles.prefChipText, compactMode && styles.prefChipTextActive]}
                >
                  {compactMode ? 'Compacto' : 'Detallado'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FlatList con Pull-to-Refresh obligatorio */}
        <FlatList
          data={processedInstruments}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshing={isFetching}
          onRefresh={refetch}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.maintenanceBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  errorSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: SIZES.borderThin,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTag: {
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  headerTagText: {
    ...TYPOGRAPHY.headerTag,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  headerTitle: {
    ...TYPOGRAPHY.headerTitle,
    fontSize: 20,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.headerSubtitle,
    fontSize: 12,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    height: SIZES.searchInputHeight,
    borderRadius: RADIUS.md,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingsHeaderButton: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  offlineBannerTextWrapper: {
    flex: 1,
    gap: 2,
  },
  offlineBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
  },
  offlineBannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  offlineRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  offlineRetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  quickPreferencesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  prefChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
  },
  prefChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryLight,
  },
  prefChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  prefChipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  resultsCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  resultsCounterText: {
    ...TYPOGRAPHY.searchCounter,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.xs,
  },
  separator: {
    height: SIZES.separatorHeight,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.emptyTitle,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.emptySubtitle,
    textAlign: 'center',
  },
});
