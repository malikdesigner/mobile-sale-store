// screens/CartScreen.js
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import CartItem from '../components/CartItem';
import SideNavigation from '../components/SideNavigation';

const GUEST_CART_KEY = 'mobileHubGuestCart';
const GUEST_CART_EXPIRY = 3 * 60 * 60 * 1000; // 3 hours

const CartScreen = ({ onNavigate, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSideNav, setShowSideNav] = useState(false);

  useEffect(() => {
    loadCart();
  }, [user]);

  const saveGuestCart = async (cartData) => {
    try {
      const cartWithTimestamp = {
        items: cartData,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartWithTimestamp));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const loadGuestCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const now = Date.now();
        
        if (now - parsedCart.timestamp > GUEST_CART_EXPIRY) {
          await AsyncStorage.removeItem(GUEST_CART_KEY);
          return [];
        }
        
        return parsedCart.items || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  };

  const clearGuestCart = async () => {
    try {
      await AsyncStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error('Error clearing guest cart:', error);
    }
  };

  const loadCart = async () => {
    if (!user) {
      try {
        const guestCartItems = await loadGuestCart();
        setCartItems(guestCartItems);
      } catch (error) {
        console.error('Error loading guest cart:', error);
        setCartItems([]);
      }
      setLoading(false);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const cart = userData?.cart || [];

      if (cart.length > 0) {
        const productIds = cart.map(item => item.productId);
        const productsQuery = query(
          collection(db, 'products'),
          where('__name__', 'in', productIds)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = {};
        productsSnapshot.docs.forEach(doc => {
          productsData[doc.id] = { id: doc.id, ...doc.data() };
        });

        const cartWithProductData = cart.map(cartItem => ({
          ...cartItem,
          product: productsData[cartItem.productId]
        })).filter(item => item.product);

        setCartItems(cartWithProductData);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
    setLoading(false);
  };

  const updateCartInFirestore = async (newCart) => {
    if (!user) {
      const cartForStorage = newCart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product
      }));
      await saveGuestCart(cartForStorage);
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        cart: newCart.map(({ product, ...item }) => item)
      });
    } catch (error) {
      Alert.alert('Update Error', 'Failed to update cart');
    }
    setUpdating(false);
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Remove all devices from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setCartItems([]);
            if (user) {
              await updateCartInFirestore([]);
            } else {
              await clearGuestCart();
            }
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    if (!user) {
      Alert.alert(
        'MobileHub Checkout',
        'Complete your purchase as a guest or join MobileHub for exclusive benefits',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Guest Checkout', onPress: () => onNavigate('checkout') },
          { text: 'Join MobileHub', onPress: () => onNavigate('login') }
        ]
      );
      return;
    }

    onNavigate('checkout');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
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
          <Ionicons name="bag" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.headerSubtitle}>
            {user ? '' : 'Guest Mode • '}{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!user && cartItems.length > 0 && (
        <View style={styles.guestBanner}>
          <Ionicons name="time" size={20} color="#FF9500" />
          <Text style={styles.guestBannerText}>
            Your items are saved for 3 hours. Join MobileHub to save permanently & get exclusive benefits.
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                updating={updating}
              />
            ))}
            
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>✨ MobileHub Benefits</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="shield-checkmark" size={18} color="#34C759" />
                  <Text style={styles.benefitText}>Secure Payment</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="refresh" size={18} color="#007AFF" />
                  <Text style={styles.benefitText}>Easy Returns</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="flash" size={18} color="#FF9500" />
                  <Text style={styles.benefitText}>Fast Delivery</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={80} color="#007AFF" />
            <Text style={styles.emptyText}>
              {user ? 'Your cart is empty' : 'Guest Shopping Cart'}
            </Text>
            <Text style={styles.emptySubtext}>
              {user 
                ? 'Discover amazing mobile devices and add them to your cart'
                : 'Start adding devices to your cart. Your selections will be saved for 3 hours.'
              }
            </Text>
            
            {!user && (
              <View style={styles.guestCartActions}>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => onNavigate('login')}
                >
                  <Ionicons name="phone-portrait" size={20} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Join MobileHub</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => onNavigate('home')}
            >
              <Text style={styles.browseButtonText}>Explore Devices</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutSection}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.totalLabel}>Total ({cartItems.length} items)</Text>
              <Text style={styles.totalPrice}>${getTotalPrice().toFixed(2)}</Text>
            </View>
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingText}>
                {getTotalPrice() > 100 ? '🚚 FREE Shipping' : '+ $9.99 Shipping'}
              </Text>
              {getTotalPrice() <= 100 && (
                <Text style={styles.freeShippingTip}>
                  Add ${(100 - getTotalPrice()).toFixed(2)} more for FREE shipping
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.checkoutButton, updating && styles.disabledButton]}
            onPress={proceedToCheckout}
            disabled={updating}
          >
            <Ionicons name="card" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>
              {updating ? 'Updating...' : user ? 'Proceed to Checkout' : 'Guest Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
          currentScreen="cart"
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
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  guestBannerText: {
    fontSize: 12,
    color: '#F57C00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
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
  guestCartActions: {
    marginBottom: 16,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    minWidth: 200,
    alignItems: 'center',
  },
  browseButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  checkoutSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  shippingInfo: {
    alignItems: 'flex-end',
  },
  shippingText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginBottom: 2,
  },
  freeShippingTip: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'right',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CartScreen;