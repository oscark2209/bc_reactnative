// src/screens/SavedScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Instrument } from '../types';
import { ItemCard } from '../components/ItemCard';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES } from '../theme';
import { SavedScreenProps } from '../navigation/types';
import { useSavedStore } from '../stores/savedStore';

export const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
  // Consumo estricto con selectores específicos de Zustand (sin re-renders globales)
  const savedItems = useSavedStore((state) => state.savedItems);
  const clearAll = useSavedStore((state) => state.clearAll);
  const toggleItem = useSavedStore((state) => state.toggleItem);

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar lista de guardados',
      '¿Estás seguro de que deseas eliminar todos los instrumentos de tu lista de favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar Todo',
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ]
    );
  };

  const handleItemPress = useCallback(
    (instrument: Instrument) => {
      navigation.navigate('HomeTab', {
        screen: 'Detail',
        params: { instrument },
      });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item: Instrument) => item.id, []);

  const renderItem: ListRenderItem<Instrument> = useCallback(
    ({ item }) => (
      <ItemCard
        item={item}
        onPress={handleItemPress}
        isSaved={true}
        onToggleSave={toggleItem}
      />
    ),
    [handleItemPress, toggleItem]
  );

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Encabezado con contador y botón de limpieza */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>SEGUIMIENTO ACADÉMICO</Text>
          </View>
          <Text style={styles.headerTitle}>Instrumentos Guardados</Text>
          <Text style={styles.headerSubtitle}>
            {savedItems.length === 1
              ? '1 instrumento en tu lista personal'
              : `${savedItems.length} instrumentos en tu lista personal`}
          </Text>
        </View>

        {savedItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={15} color={COLORS.maintenanceText} />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de guardados o Estado Vacío */}
      {savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={44} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
          <Text style={styles.emptySubtitle}>
            Aún no has agregado instrumentos a tus guardados. Explora el catálogo y toca el botón de guardar para tenerlos a mano.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
            activeOpacity={0.8}
          >
            <Ionicons name="musical-notes-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.exploreButtonText}>Explorar Catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: SIZES.borderThin,
    borderBottomColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitleContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.badgeCategoryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
  },
  headerTagText: {
    ...TYPOGRAPHY.headerTag,
  },
  headerTitle: {
    ...TYPOGRAPHY.headerTitle,
    fontSize: 20,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.headerSubtitle,
    fontSize: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.maintenanceBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.maintenance,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.maintenanceText,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  separator: {
    height: SIZES.separatorHeight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: SIZES.borderThin,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
