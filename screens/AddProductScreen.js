// screens/AddProductScreen.js
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
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AddProductScreen = ({ onNavigate, user }) => {
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
  const operatingSystems = ['iOS', 'Android', 'watchOS', 'Windows'];
  const storageOptions = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];

  useEffect(() => {
    loadUserRole();
  }, [user]);

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
            <Ionicons name="phone-portrait-outline" size={80} color="#007AFF" />
            <Text style={styles.restrictedTitle}>Join MobileHub Community</Text>
            <Text style={styles.restrictedSubtitle}>
              Only registered members can sell devices on our premium marketplace. 
              Join our community to start selling your devices!
            </Text>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => onNavigate('signup')}
            >
              <Ionicons name="phone-portrait" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join MobileHub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => onNavigate('login')}
            >
              <Text style={styles.loginButtonText}>Already a member? Sign In</Text>
            </TouchableOpacity>
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
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const { name, brand, price, imageUrl, category, condition } = formData;
    
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

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      const additionalImagesArray = formData.additionalImages
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const productData = {
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
        
        featured: userRole === 'admin' ? formData.featured : false,
        tags: tagsArray,
        
        rating: 0,
        ratingCount: 0,
        views: 0,
        likes: 0,
        
        sellerId: user.uid,
        sellerEmail: user.email,
        sellerRole: userRole,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        
        isActive: true,
        inStock: true,
      };

      console.log('Adding product:', productData);
      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log('Product added with ID:', docRef.id);

      // Reset form data
      const resetFormData = {
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
      };

      setSubmitting(false);

      Alert.alert(
        'Success! 📱', 
        'Your device has been added to the MobileHub marketplace!',
        [
          { 
            text: 'Add Another', 
            onPress: () => {
              setFormData(resetFormData);
            }
          },
          { 
            text: 'View Marketplace', 
            onPress: () => onNavigate('home') 
          }
        ]
      );

    } catch (error) {
      console.error('Error adding product:', error);
      setSubmitting(false);
      
      let errorMessage = 'Failed to add device. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to add products. Please check your account settings.';
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
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
          <Text style={styles.headerTitle}>Sell Device</Text>
          {userRole === 'admin' && (
            <Text style={styles.adminBadge}>Admin Mode</Text>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Seller Info */}
            <View style={styles.sellerBanner}>
              <View style={styles.sellerInfo}>
                <Ionicons name="phone-portrait" size={24} color="#007AFF" />
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>Selling as: {user.email}</Text>
                  <Text style={styles.sellerRole}>{userRole === 'admin' ? 'Administrator' : 'Mobile Enthusiast'}</Text>
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
                <Text style={styles.helperText}>
                  💡 Use high-quality device photos for better visibility
                </Text>
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
                  placeholder="Describe the device condition, features, any included accessories, usage history..."
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

            <TouchableOpacity
              style={[styles.addButton, submitting && styles.disabledButton]}
              onPress={handleAddProduct}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Adding to Marketplace...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="phone-portrait" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add to MobileHub</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.disclaimer}>
              <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
              <Text style={styles.disclaimerText}>
                By listing this device, you agree to our seller terms. 
                Ensure all information is accurate and images represent the actual device.
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
  joinButton: {
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
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
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
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  sellerBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  sellerRole: {
    fontSize: 14,
    color: '#007AFF',
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
  helperText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontStyle: 'italic',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
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
  addButtonText: {
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

export default AddProductScreen;