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
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1877f2', '#0a5bc4']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => router.push("/profile")}
            style={styles.iconBtn}
          >
            <LinearGradient 
              colors={['#4facfe', '#00f2fe']} 
              style={styles.iconBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => router.push("/screens/SearchScreen")}
          >
            <LinearGradient 
              colors={['#667eea', '#764ba2']} 
              style={styles.searchBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <LinearGradient
        colors={['#fff', '#f8f9fa']}
        style={styles.tabsContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
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
      </LinearGradient>

      {/* Location */}
      <View style={styles.locationRow}>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <Text style={styles.sectionTitle}>Today's picks</Text>
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-pin" size={18} color="#1877f2" />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  iconBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  searchBtnGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e6eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabs: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    fontFamily: 'sans-serif-medium'
  },
  activeTab: {
    backgroundColor: "#e7f0fd",
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabText: {
    fontSize: 16,
    color: "#1877f2",
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 20,
    fontFamily: 'sans-serif-medium'
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    fontFamily: 'sans-serif-medium'
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#1877f2",
    fontSize: 14,
    marginLeft: 4,
    fontFamily: 'sans-serif'
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: 'sans-serif-medium'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    padding: 12,
    fontFamily: 'sans-serif-medium'
  },
});