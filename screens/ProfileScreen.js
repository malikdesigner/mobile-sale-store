// screens/ProfileScreen.js
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import SideNavigation from '../components/SideNavigation';

const ProfileScreen = ({ onNavigate, user }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSideNav, setShowSideNav] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      setUserProfile(userData);
      setEditData(userData || {});
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MobileHub?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              onNavigate('home');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), editData);
      setUserProfile(editData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return 'shield-checkmark';
      case 'customer':
        return 'person';
      default:
        return 'person-outline';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#FF9500';
      case 'customer':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
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
            <Ionicons name="person" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.authRequiredContainer}>
          <Ionicons name="person-outline" size={80} color="#007AFF" />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredSubtitle}>
            Sign in to access your profile and manage your account settings.
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
            currentScreen="profile"
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
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
          <Ionicons name="person" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editing ? handleSaveProfile() : setEditing(true)}
        >
          <Ionicons 
            name={editing ? "checkmark" : "create"} 
            size={20} 
            color={editing ? "#34C759" : "#007AFF"} 
          />
          <Text style={[styles.editButtonText, editing && { color: '#34C759' }]}>
            {editing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#007AFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile?.name || 'Mobile User'}
            </Text>
            <View style={styles.roleContainer}>
              <Ionicons 
                name={getRoleIcon(userProfile?.role)} 
                size={16} 
                color={getRoleColor(userProfile?.role)} 
              />
              <Text style={[styles.roleText, { color: getRoleColor(userProfile?.role) }]}>
                {userProfile?.role === 'admin' ? 'Administrator' : 'Mobile Enthusiast'}
              </Text>
            </View>
            <Text style={styles.joinDate}>
              Member since {formatDate(userProfile?.memberSince)}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editData.name || ''}
                onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.infoValue}>{userProfile?.name || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userProfile?.email || user.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editData.phone || ''}
                onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{userProfile?.phone || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            {editing ? (
              <TextInput
                style={[styles.editInput, styles.textArea]}
                value={editData.address || ''}
                onChangeText={(text) => setEditData(prev => ({ ...prev, address: text }))}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.infoValue}>{userProfile?.address || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Stats</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.totalPurchases || 0}</Text>
              <Text style={styles.statLabel}>Purchases</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.loyaltyPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.wishlist?.length || 0}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.cart?.length || 0}</Text>
              <Text style={styles.statLabel}>Cart Items</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => onNavigate('wishlist')}
          >
            <Ionicons name="heart-outline" size={20} color="#FF3B30" />
            <Text style={styles.actionText}>View Wishlist</Text>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => onNavigate('cart')}
          >
            <Ionicons name="bag-outline" size={20} color="#34C759" />
            <Text style={styles.actionText}>View Cart</Text>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => onNavigate('addProduct')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FF9500" />
            <Text style={styles.actionText}>Sell Device</Text>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.dangerAction]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, styles.dangerText]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Cancel Edit */}
        {editing && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              setEditing(false);
              setEditData(userProfile || {});
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel Changes</Text>
          </TouchableOpacity>
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
          currentScreen="profile"
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
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
  },
  createAccountButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#8E8E93',
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
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1D1D1F',
  },
  editInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1D1D1F',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionText: {
    fontSize: 16,
    color: '#1D1D1F',
    marginLeft: 12,
    flex: 1,
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default ProfileScreen;