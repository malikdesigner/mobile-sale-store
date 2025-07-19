// screens/EditProductScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const EditProductScreen = ({ onNavigate, user, product }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    price: '',
    originalPrice: '',
    imageUrl: '',
    additionalImages: '',
    description: '',
    condition: 'new',
    category: 'smartphone',
    color: '',
    storage: '',
    ram: '',
    operatingSystem: '',
    screenSize: '',
    batteryCapacity: '',
    cameraMegapixel: '',
    processor: '',
    displayType: '',
    connectivity: '',
    weight: '',
    dimensions: '',
    warranty: '',
    tags: '',
    featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const conditions = ['new', 'like-new', 'good', 'fair'];
  const categories = ['smartphone', 'tablet', 'smartwatch', 'earbuds', 'accessories'];

  useEffect(() => {
    loadUserRole();
    if (product) {
      initializeForm();
    }
  }, [user, product]);

  const loadUserRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserRole(userData?.role || 'customer');
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole('customer');
    }
    setLoading(false);
  };

  const initializeForm = () => {
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      imageUrl: product.image || '',
      additionalImages: (product.additionalImages || []).join(', '),
      description: product.description || '',
      condition: product.condition || 'new',
      category: product.category || 'smartphone',
      color: product.color || '',
      storage: product.storage || '',
      ram: product.ram || '',
      operatingSystem: product.operatingSystem || '',
      screenSize: product.screenSize || '',
      batteryCapacity: product.batteryCapacity || '',
      cameraMegapixel: product.cameraMegapixel || '',
      processor: product.processor || '',
      displayType: product.displayType || '',
      connectivity: product.connectivity || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      warranty: product.warranty || '',
      tags: (product.tags || []).join(', '),
      featured: product.featured || false,
    });
  };

  const canEditDelete = () => {
    if (!user || !product) return false;
    if (userRole === 'admin') return true;
    return user.uid === product.sellerId;
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.restrictedContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.restrictedContent}>
            <Ionicons name="lock-closed-outline" size={80} color="#FF3B30" />
            <Text style={styles.restrictedTitle}>Access Denied</Text>
            <Text style={styles.restrictedSubtitle}>
              Please sign in to edit device listings.
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => onNavigate('login')}
            >
              <Ionicons name="log-in" size={20} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.restrictedContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.restrictedContent}>
            <Ionicons name="alert-circle-outline" size={80} color="#FF9500" />
            <Text style={styles.restrictedTitle}>Device Not Found</Text>
            <Text style={styles.restrictedSubtitle}>
              The device you're trying to edit could not be found.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!canEditDelete()) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.restrictedContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => onNavigate('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.restrictedContent}>
            <Ionicons name="shield-outline" size={80} color="#FF3B30" />
            <Text style={styles.restrictedTitle}>Permission Denied</Text>
            <Text style={styles.restrictedSubtitle}>
              You can only edit your own device listings.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading device details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const { name, brand, price, imageUrl } = formData;
    
    if (!name || !brand || !price || !imageUrl) {
      Alert.alert('Missing Information', 'Please fill in all required fields: Name, Brand, Price, and Image URL');
      return false;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
      return false;
    }

    return true;
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;

    console.log('Starting product update...');
    setSubmitting(true);
    
    try {
      // Check if we have the required data
      if (!product || !product.id) {
        throw new Error('Product ID is missing');
      }

      if (!user || !user.uid) {
        throw new Error('User not authenticated');
      }

      const additionalImagesArray = formData.additionalImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updateData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        
        image: formData.imageUrl.trim(),
        additionalImages: additionalImagesArray,
        
        description: formData.description.trim(),
        condition: formData.condition,
        category: formData.category,
        color: formData.color.trim(),
        
        // Mobile-specific fields
        storage: formData.storage.trim(),
        ram: formData.ram.trim(),
        operatingSystem: formData.operatingSystem.trim(),
        screenSize: formData.screenSize.trim(),
        batteryCapacity: formData.batteryCapacity.trim(),
        cameraMegapixel: formData.cameraMegapixel.trim(),
        processor: formData.processor.trim(),
        displayType: formData.displayType.trim(),
        connectivity: formData.connectivity.trim(),
        weight: formData.weight.trim(),
        dimensions: formData.dimensions.trim(),
        warranty: formData.warranty.trim(),
        
        featured: userRole === 'admin' ? formData.featured : product.featured,
        tags: tagsArray,
        
        updatedAt: new Date(),
      };

      console.log('Update data prepared:', updateData);
      console.log('Updating product with ID:', product.id);

      await updateDoc(doc(db, 'products', product.id), updateData);
      console.log('Product updated successfully');

    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = 'Failed to update device. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to update this product.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Product not found. It may have been deleted.';
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Always clear loading state first
      setSubmitting(false);
      Alert.alert('Error', errorMessage);
      return; // Exit early on error
    }

    // Clear loading state on success
    setSubmitting(false);
    
    // Show success message
    Alert.alert(
      'Success! 📱', 
      'Your device has been updated successfully!',
      [
        { text: 'View Marketplace', onPress: () => onNavigate('home') }
      ]
    );
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Device',
      'Are you sure you want to permanently delete this device from the marketplace? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting product with ID:', product.id);
              
              if (!product || !product.id) {
                throw new Error('Product ID is missing');
              }

              await deleteDoc(doc(db, 'products', product.id));
              console.log('Product deleted successfully');
              
              Alert.alert(
                'Deleted! 🗑️', 
                'Your device has been removed from the marketplace.',
                [
                  { text: 'OK', onPress: () => onNavigate('home') }
                ]
              );
            } catch (error) {
              console.error('Error deleting product:', error);
              
              let errorMessage = 'Failed to delete device. Please try again.';
              if (error.code === 'permission-denied') {
                errorMessage = 'You do not have permission to delete this product.';
              } else if (error.code === 'not-found') {
                errorMessage = 'Product not found. It may have already been deleted.';
              } else if (error.code === 'network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection and try again.';
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backIconButton}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Device</Text>
          {userRole === 'admin' && (
            <Text style={styles.adminBadge}>Admin Mode</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleDeleteProduct} style={styles.deleteIconButton}>
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Product Info Banner */}
            <View style={styles.productBanner}>
              <View style={styles.productInfo}>
                <Ionicons name="phone-portrait" size={24} color="#007AFF" />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>Editing: {product.name}</Text>
                  <Text style={styles.productMeta}>
                    Listed by: {product.sellerEmail?.split('@')[0]} • {product.brand}
                  </Text>
                </View>
              </View>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Device Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Device Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. iPhone 14 Pro, Samsung Galaxy S23"
                  placeholderTextColor="#8E8E93"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Brand *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apple, Samsung, etc."
                    placeholderTextColor="#8E8E93"
                    value={formData.brand}
                    onChangeText={(value) => updateFormData('brand', value)}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Model</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pro Max, Ultra, etc."
                    placeholderTextColor="#8E8E93"
                    value={formData.model}
                    onChangeText={(value) => updateFormData('model', value)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Price ($) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="899"
                    placeholderTextColor="#8E8E93"
                    value={formData.price}
                    onChangeText={(value) => updateFormData('price', value)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Original Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1099"
                    placeholderTextColor="#8E8E93"
                    value={formData.originalPrice}
                    onChangeText={(value) => updateFormData('originalPrice', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Color</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Space Black, White"
                    placeholderTextColor="#8E8E93"
                    value={formData.color}
                    onChangeText={(value) => updateFormData('color', value)}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Operating System</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="iOS 17, Android 14"
                    placeholderTextColor="#8E8E93"
                    value={formData.operatingSystem}
                    onChangeText={(value) => updateFormData('operatingSystem', value)}
                  />
                </View>
              </View>
            </View>

            {/* Categories and Condition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Category & Condition</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.chip,
                          formData.category === category && styles.selectedChip
                        ]}
                        onPress={() => updateFormData('category', category)}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.category === category && styles.selectedChipText
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Condition *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {conditions.map((condition) => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.chip,
                          formData.condition === condition && styles.selectedChip
                        ]}
                        onPress={() => updateFormData('condition', condition)}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.condition === condition && styles.selectedChipText
                        ]}>
                          {condition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Technical Specifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Specifications</Text>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Storage</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="128GB, 256GB, 512GB"
                    placeholderTextColor="#8E8E93"
                    value={formData.storage}
                    onChangeText={(value) => updateFormData('storage', value)}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>RAM</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6GB, 8GB, 12GB"
                    placeholderTextColor="#8E8E93"
                    value={formData.ram}
                    onChangeText={(value) => updateFormData('ram', value)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Screen Size (inches)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="6.1, 6.7"
                    placeholderTextColor="#8E8E93"
                    value={formData.screenSize}
                    onChangeText={(value) => updateFormData('screenSize', value)}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Battery</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4000mAh, 5000mAh"
                    placeholderTextColor="#8E8E93"
                    value={formData.batteryCapacity}
                    onChangeText={(value) => updateFormData('batteryCapacity', value)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Camera</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="48MP, 108MP"
                    placeholderTextColor="#8E8E93"
                    value={formData.cameraMegapixel}
                    onChangeText={(value) => updateFormData('cameraMegapixel', value)}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Processor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="A17 Pro, Snapdragon 8"
                    placeholderTextColor="#8E8E93"
                    value={formData.processor}
                    onChangeText={(value) => updateFormData('processor', value)}
                  />
                </View>
              </View>
            </View>

            {/* Images and Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Images & Description</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Main Image URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/device-image.jpg"
                  placeholderTextColor="#8E8E93"
                  value={formData.imageUrl}
                  onChangeText={(value) => updateFormData('imageUrl', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Additional Images (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="URL1, URL2, URL3 (comma separated)"
                  placeholderTextColor="#8E8E93"
                  value={formData.additionalImages}
                  onChangeText={(value) => updateFormData('additionalImages', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the device condition, features, any included accessories..."
                  placeholderTextColor="#8E8E93"
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tags (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="fast, gaming, photography, business (comma separated)"
                  placeholderTextColor="#8E8E93"
                  value={formData.tags}
                  onChangeText={(value) => updateFormData('tags', value)}
                />
              </View>
            </View>

            {/* Admin Features */}
            {userRole === 'admin' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👑 Admin Features</Text>
                <TouchableOpacity
                  style={[styles.toggleContainer, formData.featured && styles.toggleActive]}
                  onPress={() => updateFormData('featured', !formData.featured)}
                >
                  <Ionicons 
                    name={formData.featured ? "star" : "star-outline"} 
                    size={24} 
                    color={formData.featured ? "#FF9500" : "#8E8E93"} 
                  />
                  <Text style={[styles.toggleText, formData.featured && styles.toggleActiveText]}>
                    Featured Device (Admin Only)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.updateButton, submitting && styles.disabledButton]}
                onPress={() => {
                  if (!submitting) {
                    handleUpdateProduct();
                  }
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Updating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update Device</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, submitting && styles.disabledButton]}
                onPress={() => {
                  if (!submitting) {
                    handleDeleteProduct();
                  }
                }}
                disabled={submitting}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Delete Device</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={16} color="#007AFF" />
              <Text style={styles.disclaimerText}>
                Changes will be visible immediately on the marketplace. 
                Ensure all information is accurate before updating.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  restrictedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  restrictedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  restrictedSubtitle: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  adminBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  productBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetails: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  productMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  toggleActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9500',
  },
  toggleText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 12,
    fontWeight: '500',
  },
  toggleActiveText: {
    color: '#FF9500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  updateButton: {
    flex: 1,
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
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FF3B30',
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
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1D1D1F',
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
});

export default EditProductScreen;