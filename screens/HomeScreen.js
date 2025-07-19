// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import SideNavigation from '../components/SideNavigation';
import FilterModal from '../components/FilterModal';

const HomeScreen = ({ onNavigate, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSideNav, setShowSideNav] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [userRole, setUserRole] = useState(null);
  
  const [filters, setFilters] = useState({
    brands: [],
    priceRange: { min: 0, max: 2000 },
    models: [],
    conditions: [],
    categories: [],
    colors: [],
    storages: [],
    rams: [],
    operatingSystems: [],
    screenSizes: [],
    batteryCapacities: [],
    cameraMegapixels: [],
    rating: 0,
    featured: false,
    inStock: false,
  });

  useEffect(() => {
    loadUserRole();
    const unsubscribe = loadProducts();
    return () => unsubscribe && unsubscribe();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filters, sortBy]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserRole(userData?.role || 'customer');
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadProducts = () => {
    try {
      let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        setLoading(false);
      }, (error) => {
        console.error('Error loading products:', error);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up products listener:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                           product.name?.toLowerCase().includes(searchLower) ||
                           product.brand?.toLowerCase().includes(searchLower) ||
                           product.description?.toLowerCase().includes(searchLower) ||
                           product.model?.toLowerCase().includes(searchLower) ||
                           product.category?.toLowerCase().includes(searchLower) ||
                           product.operatingSystem?.toLowerCase().includes(searchLower);
      
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
      
      const productPrice = parseFloat(product.price) || 0;
      const matchesPrice = productPrice >= filters.priceRange.min && 
                          (filters.priceRange.max === 2000 ? true : productPrice <= filters.priceRange.max);
      
      const matchesModel = filters.models.length === 0 || 
                          (product.model && filters.models.some(model => 
                            product.model.toLowerCase().includes(model.toLowerCase())
                          ));
      
      const matchesCondition = filters.conditions.length === 0 || filters.conditions.includes(product.condition);
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      
      const matchesColor = filters.colors.length === 0 || 
                          (product.color && filters.colors.some(color => 
                            product.color.toLowerCase().includes(color.toLowerCase())
                          ));
      
      const matchesStorage = filters.storages.length === 0 || filters.storages.includes(product.storage);
      const matchesRam = filters.rams.length === 0 || filters.rams.includes(product.ram);
      const matchesOS = filters.operatingSystems.length === 0 || filters.operatingSystems.includes(product.operatingSystem);
      const matchesScreenSize = filters.screenSizes.length === 0 || filters.screenSizes.includes(product.screenSize);
      const matchesBattery = filters.batteryCapacities.length === 0 || filters.batteryCapacities.includes(product.batteryCapacity);
      const matchesCamera = filters.cameraMegapixels.length === 0 || filters.cameraMegapixels.includes(product.cameraMegapixel);
      
      const matchesRating = filters.rating === 0 || (product.rating || 0) >= filters.rating;
      const matchesFeatured = !filters.featured || product.featured;
      const matchesStock = !filters.inStock || product.inStock !== false;

      return matchesSearch && matchesBrand && matchesPrice && matchesModel && 
             matchesCondition && matchesCategory && matchesColor && matchesStorage &&
             matchesRam && matchesOS && matchesScreenSize && matchesBattery &&
             matchesCamera && matchesRating && matchesFeatured && matchesStock;
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        break;
      case 'priceHigh':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'priceLow':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      brands: [],
      priceRange: { min: 0, max: 2000 },
      models: [],
      conditions: [],
      categories: [],
      colors: [],
      storages: [],
      rams: [],
      operatingSystems: [],
      screenSizes: [],
      batteryCapacities: [],
      cameraMegapixels: [],
      rating: 0,
      featured: false,
      inStock: false,
    });
    setSearchQuery('');
    setSortBy('newest');
  };

  const getActiveFiltersCount = () => {
    return filters.brands.length + 
           filters.models.length + 
           filters.conditions.length +
           filters.categories.length +
           filters.colors.length +
           filters.storages.length +
           filters.rams.length +
           filters.operatingSystems.length +
           filters.screenSizes.length +
           filters.batteryCapacities.length +
           filters.cameraMegapixels.length +
           (filters.rating > 0 ? 1 : 0) +
           (filters.featured ? 1 : 0) +
           (filters.inStock ? 1 : 0) +
           (filters.priceRange.min > 0 || filters.priceRange.max < 2000 ? 1 : 0);
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getUniqueValues = () => {
    if (!products || products.length === 0) {
      return {
        brands: [],
        models: [],
        conditions: [],
        categories: [],
        colors: [],
        storages: [],
        rams: [],
        operatingSystems: [],
        screenSizes: [],
        batteryCapacities: [],
        cameraMegapixels: [],
      };
    }

    try {
      return {
        brands: [...new Set(products.map(product => product.brand).filter(Boolean))].sort(),
        models: [...new Set(products.map(product => product.model).filter(Boolean))].sort(),
        conditions: [...new Set(products.map(product => product.condition).filter(Boolean))].sort(),
        categories: [...new Set(products.map(product => product.category).filter(Boolean))].sort(),
        colors: [...new Set(products.map(product => product.color).filter(Boolean))].sort(),
        storages: [...new Set(products.map(product => product.storage).filter(Boolean))].sort(),
        rams: [...new Set(products.map(product => product.ram).filter(Boolean))].sort(),
        operatingSystems: [...new Set(products.map(product => product.operatingSystem).filter(Boolean))].sort(),
        screenSizes: [...new Set(products.map(product => product.screenSize).filter(Boolean))].sort(),
        batteryCapacities: [...new Set(products.map(product => product.batteryCapacity).filter(Boolean))].sort(),
        cameraMegapixels: [...new Set(products.map(product => product.cameraMegapixel).filter(Boolean))].sort(),
      };
    } catch (error) {
      console.error('Error getting unique values:', error);
      return {
        brands: [],
        models: [],
        conditions: [],
        categories: [],
        colors: [],
        storages: [],
        rams: [],
        operatingSystems: [],
        screenSizes: [],
        batteryCapacities: [],
        cameraMegapixels: [],
      };
    }
  };

  const uniqueValues = getUniqueValues();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowSideNav(true)}
          >
            <Ionicons name="menu" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.brandSection}>
            <Ionicons name="phone-portrait" size={24} color="#007AFF" />
            <Text style={styles.brandName}>MobileHub</Text>
          </View>

          <View style={styles.headerActions}>
            <Text style={styles.greeting}>
              {user ? `Welcome back! 📱` : 'Discover Tech! 📱'}
            </Text>
            <Text style={styles.welcomeText}>Premium mobile collection</Text>
          </View>
        </View>

        <View style={styles.searchFilterRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#007AFF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search phones, brands, models..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, activeFiltersCount > 0 && styles.activeFilterButton]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options" size={20} color={activeFiltersCount > 0 ? "#FFFFFF" : "#007AFF"} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} device{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
        {(activeFiltersCount > 0 || searchQuery.length > 0) && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.productsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              currentUserId={user?.uid}
              userRole={userRole}
            />
          ))}
        </View>
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="phone-portrait-outline" size={64} color="#007AFF" />
            <Text style={styles.emptyText}>
              {products.length === 0 ? 'No devices available' : 'No devices match your criteria'}
            </Text>
            <Text style={styles.emptySubtext}>
              {products.length === 0 
                ? 'Be the first to add a device to our collection!' 
                : 'Try adjusting your filters or search terms'
              }
            </Text>
            {user && (
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => onNavigate('addProduct')}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addProductButtonText}>
                  {products.length === 0 ? 'Add First Device' : 'Add New Device'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Side Navigation */}
      <Modal
        visible={showSideNav}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSideNav(false)}
      >
        <SideNavigation 
          onNavigate={onNavigate} 
          user={user} 
          onClose={() => setShowSideNav(false)}
          currentScreen="home"
        />
      </Modal>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        uniqueValues={uniqueValues}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'right',
  },
  welcomeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
    textAlign: 'right',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
  },
  filterButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;