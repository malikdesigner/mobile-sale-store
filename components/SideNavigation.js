// components/SideNavigation.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const { width } = Dimensions.get('window');

const SideNavigation = ({ onNavigate, user, onClose, currentScreen }) => {
  const handleNavigation = (screen) => {
    if (!user && (screen === 'wishlist' || screen === 'profile' || screen === 'addProduct')) {
      Alert.alert(
        'Login Required',
        `Please login to access ${screen === 'addProduct' ? 'add device' : screen}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => {
            onClose();
            onNavigate('login');
          }}
        ]
      );
      return;
    }
    
    onClose();
    onNavigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              onClose();
              onNavigate('home');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      key: 'home',
      icon: 'home-outline',
      activeIcon: 'home',
      label: 'Home',
      requiresAuth: false,
      color: '#007AFF',
    },
    {
      key: 'wishlist',
      icon: 'heart-outline',
      activeIcon: 'heart',
      label: 'Wishlist',
      requiresAuth: true,
      color: '#FF3B30',
    },
    {
      key: 'cart',
      icon: 'bag-outline',
      activeIcon: 'bag',
      label: 'Shopping Cart',
      requiresAuth: false,
      color: '#34C759',
    },
    {
      key: 'addProduct',
      icon: 'add-circle-outline',
      activeIcon: 'add-circle',
      label: 'Sell Device',
      requiresAuth: true,
      color: '#FF9500',
    },
    {
      key: 'profile',
      icon: 'person-outline',
      activeIcon: 'person',
      label: 'Profile',
      requiresAuth: true,
      color: '#5856D6',
    },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      
      <SafeAreaView style={styles.sideNav}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          
          <View style={styles.brandContainer}>
            <Ionicons name="phone-portrait" size={32} color="#007AFF" />
            <Text style={styles.brandTitle}>MobileHub</Text>
            <Text style={styles.brandSubtitle}>Premium Mobile Store</Text>
          </View>
          
          {user && (
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>NAVIGATION</Text>
            {menuItems.map((item) => {
              const isActive = currentScreen === item.key;
              const showLock = !user && item.requiresAuth;
              
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.menuItem,
                    isActive && styles.activeMenuItem,
                    isActive && { backgroundColor: item.color + '15' }
                  ]}
                  onPress={() => handleNavigation(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[
                      styles.menuIconContainer,
                      isActive && { backgroundColor: item.color + '20' }
                    ]}>
                      <Ionicons
                        name={isActive ? item.activeIcon : item.icon}
                        size={22}
                        color={isActive ? item.color : '#8E8E93'}
                      />
                      {showLock && (
                        <View style={styles.lockIndicator}>
                          <Ionicons name="lock-closed" size={10} color="#FF3B30" />
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.menuItemText,
                      isActive && { color: item.color, fontWeight: '600' }
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: item.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {!user ? (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>ACCOUNT</Text>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onNavigate('login');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="log-in-outline" size={22} color="#34C759" />
                  </View>
                  <Text style={styles.menuItemText}>Sign In</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onNavigate('signup');
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="person-add-outline" size={22} color="#007AFF" />
                  </View>
                  <Text style={styles.menuItemText}>Create Account</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>ACCOUNT</Text>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                  </View>
                  <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>SUPPORT</Text>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle-outline" size={22} color="#8E8E93" />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="information-circle-outline" size={22} color="#8E8E93" />
                </View>
                <Text style={styles.menuItemText}>About</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MobileHub v1.0</Text>
          <Text style={styles.footerSubtext}>Premium Mobile Marketplace</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideNav: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 8,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  userEmail: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuSection: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  activeMenuItem: {
    shadowColor: '#e8e9eb',
    shadowOffset: { width: 0, height: 0.4 },
    shadowOpacity: 0.1,
    shadowRadius: 0.2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  lockIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default SideNavigation;