// components/CartItem.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = ({ item, onUpdateQuantity, onRemove, updating }) => {
  const { product, quantity } = item;

  if (!product) {
    return null;
  }

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
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            
            <View style={styles.details}>
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
              {product.color && (
                <View style={styles.specChip}>
                  <Text style={styles.specText}>{product.color}</Text>
                </View>
              )}
            </View>

            {product.condition && (
              <View style={styles.conditionContainer}>
                <View style={[styles.conditionDot, { backgroundColor: getConditionColor(product.condition) }]} />
                <Text style={styles.conditionText}>Condition: {product.condition}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(product.id)}
            disabled={updating}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, (updating || quantity <= 1) && styles.disabledButton]}
              onPress={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={updating || quantity <= 1}
            >
              <Ionicons name="remove" size={16} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, updating && styles.disabledButton]}
              onPress={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={updating}
            >
              <Ionicons name="add" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>${product.price} each</Text>
            <Text style={styles.totalPrice}>
              ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    marginLeft: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  brand: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 2,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  specChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  specText: {
    fontSize: 10,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  conditionText: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quantityButton: {
    padding: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.3,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#8E8E93',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 2,
  },
});

export default CartItem;