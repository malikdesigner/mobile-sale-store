// components/ProductCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProductCard = ({ product, onNavigate, currentUserId, userRole }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const canEditDelete = () => {
    if (!currentUserId) return false;
    if (userRole === 'admin') return true;
    return currentUserId === product.sellerId;
  };

  const handleDelete = () => {
    if (!canEditDelete()) {
      Alert.alert('Permission Denied', 'You can only delete your own devices');
      return;
    }

    Alert.alert(
      'Delete Device',
      'Are you sure you want to remove this device from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', product.id));
              Alert.alert('Success', 'Device removed successfully!');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!canEditDelete()) {
      Alert.alert('Permission Denied', 'You can only edit your own devices');
      return;
    }
    onNavigate('editProduct', product);
  };

  const toggleWishlist = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'Please login to save to wishlist');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUserId);
      if (isLiked) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(product.id)
        });
        setIsLiked(false);
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(product.id)
        });
        setIsLiked(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const addToCart = async () => {
    setIsAddingToCart(true);
    try {
      if (currentUserId) {
        const userRef = doc(db, 'users', currentUserId);
        await updateDoc(userRef, {
          cart: arrayUnion({
            productId: product.id,
            quantity: 1,
            addedAt: new Date()
          })
        });
        Alert.alert('Added to Cart! 🛒', 'Device has been added to your cart');
      } else {
        Alert.alert('Added to Cart! 🛒', 
          `${product.brand} ${product.name} has been added to your guest cart.\n\nNote: Guest cart items are temporary. Login to save items permanently.`, [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => onNavigate('cart') },
          { text: 'Checkout Now', onPress: () => onNavigate('checkout') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
    setIsAddingToCart(false);
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new':
        return '#34C759';
      case 'like-new':
        return '#007AFF';
      case 'good':
        return '#FF9500';
      case 'fair':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.productCard}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        {/* Wishlist Button */}
        {currentUserId && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={toggleWishlist}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={16}
              color={isLiked ? "#FF3B30" : "#8E8E93"}
            />
          </TouchableOpacity>
        )}

        {/* Top Badges */}
        <View style={styles.topBadges}>
          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercentage}%</Text>
            </View>
          )}
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Condition Badge */}
        <View style={styles.bottomBadge}>
          <View style={[styles.conditionDot, { backgroundColor: getConditionColor(product.condition) }]} />
          <Text style={styles.conditionText}>{product.condition}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FF9500" />
              <Text style={styles.rating}>{product.rating || 0}</Text>
            </View>
          </View>
        </View>

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

        {/* Specifications */}
        <View style={styles.specsContainer}>
          {product.storage && (
            <View style={styles.specChip}>
              <Text style={styles.specText}>{product.storage}</Text>
            </View>
          )}
          {product.ram && (
            <View style={styles.specChip}>
              <Text style={styles.specText}>{product.ram}</Text>
            </View>
          )}
          {product.screenSize && (
            <View style={styles.specChip}>
              <Text style={styles.specText}>{product.screenSize}"</Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
            <Text style={styles.price}>${product.price}</Text>
          </View>
          <View style={styles.stockContainer}>
            <View style={[styles.stockDot, { backgroundColor: product.inStock ? '#34C759' : '#FF3B30' }]} />
            <Text style={[styles.stockText, { color: product.inStock ? '#34C759' : '#FF3B30' }]}>
              {product.inStock ? 'Available' : 'Sold Out'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {canEditDelete() ? (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Ionicons name="create-outline" size={14} color="#007AFF" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={14} color="#FF3B30" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addToCartButton, 
                (isAddingToCart || !product.inStock) && styles.disabledButton
              ]}
              onPress={addToCart}
              disabled={isAddingToCart || !product.inStock}
            >
              <Ionicons 
                name={product.inStock ? "bag-add" : "close-circle"} 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.addToCartText}>
                {isAddingToCart ? 'Adding...' : !product.inStock ? 'Sold Out' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seller Info */}
        {(userRole === 'admin' || currentUserId !== product.sellerId) && (
          <View style={styles.sellerContainer}>
            <Text style={styles.sellerText}>
              by {product.sellerEmail?.split('@')[0] || 'Seller'}
            </Text>
            {userRole === 'admin' && (
              <View style={styles.adminIndicator}>
                <Ionicons name="shield-checkmark" size={10} color="#007AFF" />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F8F9FA',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 3,
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  conditionText: {
    color: '#1D1D1F',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Content Section
  contentContainer: {
    padding: 12,
  },
  headerRow: {
    marginBottom: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productBrand: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    color: '#FF9500',
    marginLeft: 2,
    fontWeight: '500',
  },
  
  // Product Name
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    lineHeight: 18,
    marginBottom: 8,
  },

  // Specifications
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  specChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specText: {
    fontSize: 10,
    color: '#1D1D1F',
    fontWeight: '500',
  },

  // Price Section
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 10,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Action Section
  actionSection: {
    marginBottom: 8,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  editText: {
    fontSize: 11,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  deleteText: {
    fontSize: 11,
    color: '#FF3B30',
    marginLeft: 4,
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  addToCartText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },

  // Seller Section
  sellerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  sellerText: {
    fontSize: 10,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  adminIndicator: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    padding: 2,
  },
});

export default ProductCard;