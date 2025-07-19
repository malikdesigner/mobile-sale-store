// screens/WishlistScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import SideNavigation from '../components/SideNavigation';

const WishlistScreen = ({ onNavigate, user }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSideNav, setShowSideNav] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const wishlist = userData?.wishlist || [];
      setUserRole(userData?.role || 'customer');

      if (wishlist.length > 0) {
        const productsQuery = query(
          collection(db, 'products'),
          where('__name__', 'in', wishlist)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const wishlistProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWishlistItems(wishlistProducts);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (productId) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this device from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                wishlist: arrayRemove(productId)
              });
              setWishlistItems(prev => prev.filter(item => item.id !== productId));
              Alert.alert('Removed', 'Device removed from wishlist');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from wishlist');
            }
          },
        },
      ]
    );
  };

  const clearWishlist = async () => {
    Alert.alert(
      'Clear Wishlist',
      'Remove all devices from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                wishlist: []
              });
              setWishlistItems([]);
              Alert.alert('Cleared', 'Wishlist cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowSideNav(true)}
          >
            <Ionicons name="menu" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Ionicons name="heart" size={24} color="#FF3B30" />
            <Text style={styles.headerTitle}>Wishlist</Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.authRequiredContainer}>
          <Ionicons name="heart-outline" size={80} color="#FF3B30" />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredSubtitle}>
            Sign in to save your favorite devices and access them from any device.
          </Text>
          
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => onNavigate('login')}
          >
            <Ionicons name="log-in" size={20} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => onNavigate('signup')}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => onNavigate('home')}
          >
            <Text style={styles.browseButtonText}>Browse Devices</Text>
          </TouchableOpacity>
        </View>

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
            currentScreen="wishlist"
          />
        </Modal>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSideNav(true)}
        >
          <Ionicons name="menu" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.headerSubtitle}>
            {wishlistItems.length} device{wishlistItems.length !== 1 ? 's' : ''}
          </Text>
          {wishlistItems.length > 0 && (
            <TouchableOpacity onPress={clearWishlist}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {wishlistItems.length > 0 ? (
          <>
            <View style={styles.wishlistInfo}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.wishlistInfoText}>
                Your saved devices. Tap the heart again to remove from wishlist.
              </Text>
            </View>

            <View style={styles.productsGrid}>
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  currentUserId={user?.uid}
                  userRole={userRole}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#FF3B30" />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Start adding devices you love to your wishlist by tapping the heart icon
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => onNavigate('home')}
            >
              <Ionicons name="phone-portrait" size={20} color="#FFFFFF" />
              <Text style={styles.exploreButtonText}>Explore Devices</Text>
            </TouchableOpacity>
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
          currentScreen="wishlist"
        />
      </Modal>
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
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  authRequiredSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createAccountButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 16,
  },
  createAccountButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  browseButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  wishlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  wishlistInfoText: {
    fontSize: 12,
    color: '#1565C0',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  exploreButton: {
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
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WishlistScreen;