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
import { useItems } from '../hooks/useItems';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Consumo de TanStack Query v5 para datos en red con Axios
  const { data, isLoading, isError, error, refetch, isFetching } = useItems();
  const instruments = data || [];

  // 2. Consumo estricto del store global de Zustand con selectores específicos
  const savedItems = useSavedStore((state) => state.savedItems);
  const toggleItem = useSavedStore((state) => state.toggleItem);

  // Set optimizado para verificación O(1) de instrumentos guardados
  const savedIdsSet = useMemo(
    () => new Set(savedItems.map((item) => item.id)),
    [savedItems]
  );

  // 3. Filtrado en tiempo real con useMemo sobre los datos provistos por la API
  const filteredInstruments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return instruments;
    }
    return instruments.filter(
      (instrument) =>
        instrument.name.toLowerCase().includes(query) ||
        instrument.category.toLowerCase().includes(query) ||
        instrument.level.toLowerCase().includes(query) ||
        instrument.roomLocation.toLowerCase().includes(query) ||
        instrument.responsibleTeacher.name.toLowerCase().includes(query)
    );
  }, [searchQuery, instruments]);

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

  // 7. renderItem memorizado con useCallback
  const renderItem: ListRenderItem<Instrument> = useCallback(
    ({ item }) => (
      <ItemCard
        item={item}
        onPress={handleItemPress}
        onEdit={handleEditPress}
        isSaved={savedIdsSet.has(item.id)}
        onToggleSave={toggleItem}
      />
    ),
    [handleItemPress, handleEditPress, savedIdsSet, toggleItem]
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
        {/* Encabezado Principal con botón para crear nuevo instrumento */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>CONSERVATORIO ACADÉMICO</Text>
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('Create')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={COLORS.textInverse} />
              <Text style={styles.createButtonText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Catálogo de Instrumentos</Text>
          <Text style={styles.headerSubtitle}>
            Datos consumidos en vivo mediante Axios y TanStack Query v5
          </Text>
        </View>

        {/* Sección de Búsqueda */}
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
              {filteredInstruments.length} de {instruments.length} registros en caché
            </Text>
          </View>
        </View>

        {/* FlatList con Pull-to-Refresh obligatorio */}
        <FlatList
          data={filteredInstruments}
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
  resultsCounterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
