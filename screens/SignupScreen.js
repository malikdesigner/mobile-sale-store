// screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const SignupScreen = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleOptions = [
    { 
      value: 'customer', 
      label: 'Mobile Enthusiast', 
      icon: 'phone-portrait-outline', 
      description: 'Buy & sell mobile devices' 
    },
    { 
      value: 'admin', 
      label: 'Store Administrator', 
      icon: 'shield-checkmark-outline', 
      description: 'Manage the MobileHub platform' 
    },
  ];

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRoleSelect = (role) => {
    updateFormData('role', role);
    setShowRoleDropdown(false);
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone, role } = formData;
    
    if (!name || !email || !password || !confirmPassword || !phone || !role) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address || '',
        role: formData.role,
        createdAt: new Date(),
        wishlist: [],
        cart: [],
        isActive: true,
        memberSince: new Date(),
        totalPurchases: 0,
        loyaltyPoints: 0,
      });

      const selectedRole = roleOptions.find(option => option.value === formData.role);
      Alert.alert(
        'Welcome to MobileHub! 📱', 
        `Your ${selectedRole?.label} account has been created successfully!`
      );
      onNavigate('home');
    } catch (error) {
      console.log(error);
      let errorMessage = 'Account creation failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered with MobileHub';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password';
      }
      Alert.alert('Signup Error', errorMessage);
    }
    setLoading(false);
  };

  const selectedRole = roleOptions.find(option => option.value === formData.role) || { 
    icon: "chevron-down-outline", 
    label: "Choose Your Role *" 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => onNavigate('home')}
            >
              <Ionicons name="arrow-back" size={24} color="#1D1D1F" />
            </TouchableOpacity>
          </View>

          {/* Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.brandContainer}>
              <Ionicons name="phone-portrait" size={48} color="#007AFF" />
              <Text style={styles.brandTitle}>MobileHub</Text>
              <Text style={styles.brandSubtitle}>Join the mobile revolution</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Start your mobile journey with us</Text>
            
            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.roleSelector}
                onPress={() => setShowRoleDropdown(true)}
              >
                <Ionicons 
                  name={formData.role ? selectedRole.icon : "person-outline"} 
                  size={20} 
                  color={formData.role ? "#007AFF" : "#8E8E93"} 
                  style={styles.inputIcon} 
                />
                <Text style={[
                  styles.roleSelectorText,
                  !formData.role && styles.placeholderText
                ]}>
                  {formData.role ? selectedRole.label : "Choose Your Role *"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  placeholderTextColor="#8E8E93"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address *"
                  placeholderTextColor="#8E8E93"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number *"
                  placeholderTextColor="#8E8E93"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  returnKeyType="next"
                    maxLength={10}
                    keyboardType="number-pad"


                />
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Ionicons name="location-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Shipping Address (Optional)"
                  placeholderTextColor="#8E8E93"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create Password (min 6 characters) *"
                  placeholderTextColor="#8E8E93"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password *"
                  placeholderTextColor="#8E8E93"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#8E8E93" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity 
              style={[styles.createButton, loading && styles.disabledButton]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.createButtonText}>Creating Account...</Text>
              ) : (
                <>
                  <Ionicons name="phone-portrait" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>
                    {formData.role ? `Join as ${selectedRole.label}` : 'Create Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => onNavigate('login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Guest Mode */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => onNavigate('home')}
            >
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Role Selection Modal */}
          <Modal
            visible={showRoleDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowRoleDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowRoleDropdown(false)}
            >
              <View style={styles.roleModal}>
                <Text style={styles.roleModalTitle}>Choose Your Role</Text>
                {roleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.roleOption,
                      formData.role === option.value && styles.selectedRoleOption
                    ]}
                    onPress={() => handleRoleSelect(option.value)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={formData.role === option.value ? "#007AFF" : "#8E8E93"} 
                    />
                    <View style={styles.roleOptionContent}>
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === option.value && styles.selectedRoleOptionText
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.roleOptionDescription}>{option.description}</Text>
                    </View>
                    {formData.role === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
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
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  brandContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textAreaWrapper: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  passwordToggle: {
    padding: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  roleSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
  },
  placeholderText: {
    color: '#8E8E93',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
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
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signInText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signInLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  guestButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  roleModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedRoleOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  roleOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  roleOptionText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  selectedRoleOptionText: {
    color: '#007AFF',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default SignupScreen;