import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import marketplaceService, { MarketplaceItem, MarketplaceCategory } from '../lib/services/marketplaceService';

const COLORS = {
  primary: '#0A2463',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setSelectedCategory(null);
    const [itemData, catData] = await Promise.all([
      marketplaceService.getItems(),
      marketplaceService.getCategories(),
    ]);
    setItems(itemData);
    setCategories(catData);
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSelectedCategory(null);
    const results = await marketplaceService.searchItems(search);
    setItems(results);
    setLoading(false);
  };

  const handleCategory = async (catId: number) => {
    setSelectedCategory(catId);
    setLoading(true);
    const results = await marketplaceService.getItemsByCategory(catId);
    setItems(results);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => router.push({ pathname: '/marketplace/MarketplaceItemScreen', params: { itemId: item.id } })}>
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.itemPrice}>${item.price}{item.negotiable ? ' (neg.)' : ''}</Text>
      <Text style={styles.itemLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#1A4B8C']} style={styles.header}>
        <Text style={styles.logo}>Marketplace</Text>
        <TouchableOpacity style={styles.sellBtn} onPress={() => router.push('/marketplace/SellItemScreen')}>
          <Ionicons name="add-circle" size={24} color={COLORS.accent} />
          <Text style={styles.sellBtnText}>Sell</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.lightText} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items, categories..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        <TouchableOpacity style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]} onPress={fetchData}>
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => handleCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.itemsGrid}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: COLORS.lightText, marginTop: 32 }}>No items found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: COLORS.primary,
  },
  logo: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  sellBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  sellBtnText: { color: COLORS.accent, fontWeight: 'bold', marginLeft: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, margin: 16, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 16 },
  categoriesRow: { flexGrow: 0, paddingHorizontal: 8, paddingBottom: 8 },
  categoryChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.text, fontWeight: '500' },
  categoryTextActive: { color: COLORS.white },
  itemsGrid: { paddingHorizontal: 8, paddingBottom: 80 },
  itemCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, margin: 8, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  itemImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  itemTitle: { fontWeight: 'bold', fontSize: 15, color: COLORS.text, marginBottom: 2 },
  itemPrice: { color: COLORS.accent, fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  itemLocation: { color: COLORS.lightText, fontSize: 13 },
});