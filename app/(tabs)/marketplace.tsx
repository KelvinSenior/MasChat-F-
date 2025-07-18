import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Color Palette (matching home screen)
const COLORS = {
  primary: '#0A2463',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const products = [
  {
    id: "1",
    title: "PS 4",
    price: "GHS350",
    image: "https://i.imgur.com/6XbK6bE.jpg",
  },
  {
    id: "2",
    title: "Nike Dunks",
    price: "GHS420",
    image: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
  {
    id: "3",
    title: "Quality wig",
    price: "GHS200",
    image: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "4",
    title: "Men sneakers",
    price: "GHS350",
    image: "https://i.imgur.com/5tj6S7Ol.jpg",
  },
  {
    id: "5",
    title: "Car",
    price: "GHS??",
    image: "https://i.imgur.com/1A5QH0W.jpg",
  },
  {
    id: "6",
    title: "Bike",
    price: "GHS??",
    image: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
];

export default function Marketplace() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#1A4B8C']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.logo}>
          Mas<Text style={{ color: COLORS.accent }}>Chat</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => router.push("/profile")}
            style={styles.iconBtn}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/screens/SearchScreen")}
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Marketplace Title */}
      <View style={styles.marketplaceHeader}>
        <Text style={styles.marketplaceTitle}>Marketplace</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>For you</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Location */}
      <View style={styles.locationRow}>
        <Text style={styles.sectionTitle}>Today's picks</Text>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-pin" size={18} color={COLORS.primary} />
          <Text style={styles.locationText}>Accra, Ghana · 5 km</Text>
        </View>
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
              style={styles.priceOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Text style={styles.cardPrice}>{item.price}</Text>
            </LinearGradient>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  marketplaceHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  marketplaceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: "500",
  },
  activeTab: {
    backgroundColor: '#e7f0fd',
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 12,
    backgroundColor: COLORS.white,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: COLORS.primary,
    fontSize: 14,
    marginLeft: 4,
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    padding: 8,
  },
  cardPrice: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    padding: 12,
  },
});