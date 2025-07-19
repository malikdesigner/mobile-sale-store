// screens/CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SideNavigation from '../components/SideNavigation';

const CheckoutScreen = ({ onNavigate, user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSideNav, setShowSideNav] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'USA',
  });

  useEffect(() => {
    loadCartItems();
    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const loadUserInfo = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      if (userData) {
        setShippingInfo(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || user.email,
          phone: userData.phone || '',
          address: userData.address || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadCartItems = async () => {
    // This would normally load from the actual cart
    // For now, we'll show a simple checkout interface
    setCartItems([]);
    setLoading(false);
  };

  const updateShippingInfo = (key, value) => {
    setShippingInfo(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax
    };
  };

  const validateForm = () => {
    const { name, email, phone, address, city, zipCode } = shippingInfo;
    if (!name || !email || !phone || !address || !city || !zipCode) {
      Alert.alert('Missing Information', 'Please fill in all shipping details');
      return false;
    }
    return true;
  };

  const processOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      // Create order document
      const orderData = {
        userId: user?.uid || null,
        userEmail: shippingInfo.email,
        items: cartItems,
        shippingInfo,
        paymentMethod,
        orderTotal: calculateTotal().total,
        status: 'pending',
        createdAt: new Date(),
        orderNumber: `MB${Date.now()}`,
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Clear cart if user is logged in
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          cart: []
        });
      }

      Alert.alert(
        'Order Placed! 🎉',
        `Thank you for your purchase! Your order number is ${orderData.orderNumber}. You will receive a confirmation email shortly.`,
        [
          { text: 'Continue Shopping', onPress: () => onNavigate('home') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to process order: ${error.message}`);
    }
    setProcessing(false);
  };

  const totals = calculateTotal();

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
          <Ionicons name="card" size={24} color="#34C759" />
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => onNavigate('cart')}
        >
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Shipping Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#8E8E93"
              value={shippingInfo.name}
              onChangeText={(value) => updateShippingInfo('name', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor="#8E8E93"
              value={shippingInfo.email}
              onChangeText={(value) => updateShippingInfo('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#8E8E93"
              value={shippingInfo.phone}
              onChangeText={(value) => updateShippingInfo('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Street Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main Street"
              placeholderTextColor="#8E8E93"
              value={shippingInfo.address}
              onChangeText={(value) => updateShippingInfo('address', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="New York"
                placeholderTextColor="#8E8E93"
                value={shippingInfo.city}
                onChangeText={(value) => updateShippingInfo('city', value)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="10001"
                placeholderTextColor="#8E8E93"
                value={shippingInfo.zipCode}
                onChangeText={(value) => updateShippingInfo('zipCode', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card" size={24} color="#007AFF" />
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>Credit/Debit Card</Text>
              <Text style={styles.paymentOptionSubtitle}>Visa, Mastercard, American Express</Text>
            </View>
            {paymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'paypal' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <Ionicons name="logo-paypal" size={24} color="#003087" />
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>PayPal</Text>
              <Text style={styles.paymentOptionSubtitle}>Pay with your PayPal account</Text>
            </View>
            {paymentMethod === 'paypal' && (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'apple' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('apple')}
          >
            <Ionicons name="logo-apple" size={24} color="#1D1D1F" />
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>Apple Pay</Text>
              <Text style={styles.paymentOptionSubtitle}>Touch ID or Face ID</Text>
            </View>
            {paymentMethod === 'apple' && (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>
          
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="bag-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add some devices to proceed with checkout</Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => onNavigate('home')}
              >
                <Text style={styles.shopButtonText}>Browse Devices</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName}>{item.product.name}</Text>
                  <Text style={styles.orderItemDetails}>
                    {item.product.brand} • Qty: {item.quantity}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.orderTotals}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${totals.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Shipping</Text>
                  <Text style={styles.totalValue}>
                    {totals.shipping === 0 ? 'FREE' : `${totals.shipping.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax</Text>
                  <Text style={styles.totalValue}>${totals.tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={styles.finalTotalLabel}>Total</Text>
                  <Text style={styles.finalTotalValue}>${totals.total.toFixed(2)}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutFooter}>
          <TouchableOpacity
            style={[styles.placeOrderButton, processing && styles.disabledButton]}
            onPress={processOrder}
            disabled={processing}
          >
            {processing ? (
              <>
                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                <Text style={styles.placeOrderButtonText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.placeOrderButtonText}>
                  Place Order • ${totals.total.toFixed(2)}
                </Text>
              </>
            )}
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
          currentScreen="checkout"
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1D1D1F',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedPaymentOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  paymentOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  orderItemDetails: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  orderTotals: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 8,
    fontWeight: '500',
  },
  checkoutFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#34C759',
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
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default CheckoutScreen;