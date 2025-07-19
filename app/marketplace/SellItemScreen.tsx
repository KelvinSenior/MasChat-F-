import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import marketplaceService, { MarketplaceCategory } from '../lib/services/marketplaceService';

const COLORS = {
  primary: '#0A2463',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  error: '#ff4444',
};

export default function SellItemScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState<MarketplaceCategory | null>(null);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [condition, setCondition] = useState('New');
  const [images, setImages] = useState<string[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState('Local Pickup');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [summaryError, setSummaryError] = useState('');

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const cats = await marketplaceService.getCategories();
    setCategories(cats);
  };

  const pickImage = async () => {
    if (images.length >= 8) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages([...images, result.assets[0].uri]);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title) newErrors.title = 'Title is required.';
    if (!price) newErrors.price = 'Price is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (images.length === 0) newErrors.images = 'At least one image is required.';
    return newErrors;
  };

  const handleSubmit = async () => {
    setSummaryError('');
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setSummaryError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      // TODO: Upload images to server and get URLs
      const uploadedImages = images; // Replace with actual upload logic
      await marketplaceService.createItem({
        title,
        description,
        price: parseFloat(price),
        negotiable,
        category: category || undefined,
        condition,
        images: uploadedImages,
        deliveryMethod,
        location,
        status: 'active',
      });
      Alert.alert('Success', 'Item listed successfully!');
      router.back();
    } catch (e) {
      setSummaryError('Failed to list item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.header}>Sell an Item</Text>
      </View>
      {summaryError ? <Text style={styles.summaryError}>{summaryError}</Text> : null}
      {/* Images */}
      <Text style={styles.label}>Images <Text style={styles.required}>*</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.image} />
        ))}
        {images.length < 8 && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="add" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
      {errors.images && <Text style={styles.error}>{errors.images}</Text>}
      {/* Title */}
      <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      {errors.title && <Text style={styles.error}>{errors.title}</Text>}
      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      {/* Price */}
      <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      {errors.price && <Text style={styles.error}>{errors.price}</Text>}
      {/* Negotiable */}
      <TouchableOpacity style={styles.negotiableRow} onPress={() => setNegotiable(!negotiable)}>
        <Ionicons name={negotiable ? 'checkbox' : 'square-outline'} size={22} color={COLORS.primary} />
        <Text style={styles.negotiableText}>Negotiable</Text>
      </TouchableOpacity>
      {/* Category */}
      <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
      {categories.length === 0 ? (
        <Text style={styles.noCategories}>No categories available. Please try again later.</Text>
      ) : (
        <View style={styles.categoriesWrap}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.categoryChip, category?.id === cat.id && styles.categoryChipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.categoryText, category?.id === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errors.category && <Text style={styles.error}>{errors.category}</Text>}
      {/* Condition */}
      <Text style={styles.label}>Condition</Text>
      <View style={styles.conditionRow}>
        {['New', 'Used', 'Refurbished'].map(cond => (
          <TouchableOpacity key={cond} style={[styles.conditionChip, condition === cond && styles.conditionChipActive]} onPress={() => setCondition(cond)}>
            <Text style={[styles.conditionText, condition === cond && styles.conditionTextActive]}>{cond}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Delivery Method */}
      <Text style={styles.label}>Delivery Method</Text>
      <View style={styles.deliveryRow}>
        {['Local Pickup', 'Shipping'].map(method => (
          <TouchableOpacity key={method} style={[styles.deliveryChip, deliveryMethod === method && styles.deliveryChipActive]} onPress={() => setDeliveryMethod(method)}>
            <Text style={[styles.deliveryText, deliveryMethod === method && styles.deliveryTextActive]}>{method}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitBtnText}>{loading ? 'Listing...' : 'List Item'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16, marginTop: 16 },
  summaryError: { color: COLORS.error, fontWeight: 'bold', marginBottom: 12, fontSize: 16 },
  label: { color: COLORS.text, fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  required: { color: COLORS.error },
  imagesRow: { flexDirection: 'row', marginBottom: 8 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  addImageBtn: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#e4e6eb', justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: COLORS.white, borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16, color: COLORS.text },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 4 },
  negotiableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  negotiableText: { marginLeft: 8, color: COLORS.text, fontSize: 16 },
  categoriesRow: { flexGrow: 0, paddingBottom: 8, marginBottom: 4 },
  categoryChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.text, fontWeight: '500' },
  categoryTextActive: { color: COLORS.white },
  conditionRow: { flexDirection: 'row', marginBottom: 8 },
  conditionChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  conditionChipActive: { backgroundColor: COLORS.primary },
  conditionText: { color: COLORS.text, fontWeight: '500' },
  conditionTextActive: { color: COLORS.white },
  deliveryRow: { flexDirection: 'row', marginBottom: 8 },
  deliveryChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  deliveryChipActive: { backgroundColor: COLORS.primary },
  deliveryText: { color: COLORS.text, fontWeight: '500' },
  deliveryTextActive: { color: COLORS.white },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  backBtn: { marginRight: 12, padding: 4 },
  noCategories: { color: COLORS.error, fontSize: 15, marginBottom: 8 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, paddingBottom: 8 },
}); 