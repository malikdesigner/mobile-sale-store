// components/FilterModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, filters, setFilters, uniqueValues }) => {
  const conditions = ['new', 'like-new', 'good', 'fair'];
  const categories = ['smartphone', 'tablet', 'smartwatch', 'earbuds', 'accessories'];
  const operatingSystems = ['iOS', 'Android', 'watchOS', 'Windows'];
  const storageOptions = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
  const screenSizes = ['4.0', '4.7', '5.0', '5.5', '6.0', '6.1', '6.5', '6.7', '7.0', '8.0', '10.0', '11.0', '12.9'];
  const batteryCapacities = ['2000mAh', '3000mAh', '4000mAh', '5000mAh', '6000mAh'];
  const cameraMegapixels = ['8MP', '12MP', '16MP', '20MP', '48MP', '64MP', '108MP'];

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      brands: [],
      priceRange: { min: 0, max: 2000 },
      models: [],
      conditions: [],
      categories: [],
      colors: [],
      storages: [],
      rams: [],
      operatingSystems: [],
      screenSizes: [],
      batteryCapacities: [],
      cameraMegapixels: [],
      rating: 0,
      featured: false,
      inStock: false,
    });
  };

  const FilterSection = ({ title, items, filterKey, type = 'array', icon }) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {icon && <Ionicons name={icon} size={20} color="#007AFF" />}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.chipContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                type === 'array' 
                  ? filters[filterKey].includes(item) && styles.selectedChip
                  : filters[filterKey] === item && styles.selectedChip
              ]}
              onPress={() => 
                type === 'array' 
                  ? toggleArrayFilter(filterKey, item)
                  : updateFilter(filterKey, item)
              }
            >
              <Text style={[
                styles.chipText,
                type === 'array'
                  ? filters[filterKey].includes(item) && styles.selectedChipText
                  : filters[filterKey] === item && styles.selectedChipText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="options" size={20} color="#007AFF" />
            <Text style={styles.headerTitle}>Device Filters</Text>
          </View>
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Price Range</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>
                ${filters.priceRange.min} - ${filters.priceRange.max === 2000 ? '2000+' : filters.priceRange.max}
              </Text>
            </View>
            <View style={styles.priceInputContainer}>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 0 && filters.priceRange.max === 2000 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 0, max: 2000 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 0 && filters.priceRange.max === 2000 && styles.selectedPriceButtonText
                ]}>All Prices</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 0 && filters.priceRange.max === 200 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 0, max: 200 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 0 && filters.priceRange.max === 200 && styles.selectedPriceButtonText
                ]}>Under $200</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 200 && filters.priceRange.max === 500 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 200, max: 500 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 200 && filters.priceRange.max === 500 && styles.selectedPriceButtonText
                ]}>$200 - $500</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 500 && filters.priceRange.max === 1000 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 500, max: 1000 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 500 && filters.priceRange.max === 1000 && styles.selectedPriceButtonText
                ]}>$500 - $1000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priceButton,
                  filters.priceRange.min === 1000 && filters.priceRange.max === 2000 && styles.selectedPriceButton
                ]}
                onPress={() => updateFilter('priceRange', { min: 1000, max: 2000 })}
              >
                <Text style={[
                  styles.priceButtonText,
                  filters.priceRange.min === 1000 && filters.priceRange.max === 2000 && styles.selectedPriceButtonText
                ]}>$1000+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Brands */}
          <FilterSection 
            title="Brands" 
            items={uniqueValues?.brands || []} 
            filterKey="brands" 
            icon="phone-portrait-outline"
          />

          {/* Categories */}
          <FilterSection 
            title="Categories" 
            items={categories} 
            filterKey="categories" 
            icon="grid-outline"
          />

          {/* Operating System */}
          <FilterSection 
            title="Operating System" 
            items={operatingSystems} 
            filterKey="operatingSystems" 
            icon="settings-outline"
          />

          {/* Storage */}
          <FilterSection 
            title="Storage" 
            items={storageOptions} 
            filterKey="storages" 
            icon="archive-outline"
          />

          {/* RAM */}
          <FilterSection 
            title="RAM" 
            items={ramOptions} 
            filterKey="rams" 
            icon="hardware-chip-outline"
          />

          {/* Screen Size */}
          <FilterSection 
            title="Screen Size (inches)" 
            items={screenSizes} 
            filterKey="screenSizes" 
            icon="tablet-portrait-outline"
          />

          {/* Battery Capacity */}
          <FilterSection 
            title="Battery Capacity" 
            items={batteryCapacities} 
            filterKey="batteryCapacities" 
            icon="battery-charging-outline"
          />

          {/* Camera Megapixels */}
          <FilterSection 
            title="Camera" 
            items={cameraMegapixels} 
            filterKey="cameraMegapixels" 
            icon="camera-outline"
          />

          {/* Conditions */}
          <FilterSection 
            title="Condition" 
            items={conditions} 
            filterKey="conditions" 
            icon="checkmark-circle-outline"
          />

          {/* Colors */}
          {uniqueValues?.colors && uniqueValues.colors.length > 0 && (
            <FilterSection 
              title="Colors" 
              items={uniqueValues.colors} 
              filterKey="colors" 
              icon="color-palette-outline"
            />
          )}

          {/* Rating */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingChip,
                    filters.rating === rating && styles.selectedChip
                  ]}
                  onPress={() => updateFilter('rating', rating)}
                >
                  <Ionicons
                    name="star"
                    size={16}
                    color={filters.rating === rating ? "#FFFFFF" : "#FF9500"}
                  />
                  <Text style={[
                    styles.chipText,
                    filters.rating === rating && styles.selectedChipText
                  ]}>
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Special Filters */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Special Filters</Text>
            </View>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.specialChip,
                  filters.featured && styles.selectedSpecialChip
                ]}
                onPress={() => updateFilter('featured', !filters.featured)}
              >
                <Ionicons 
                  name={filters.featured ? "star" : "star-outline"} 
                  size={16} 
                  color={filters.featured ? "#FFFFFF" : "#FF9500"} 
                />
                <Text style={[
                  styles.specialChipText,
                  filters.featured && styles.selectedSpecialChipText,
                ]}>
                  Featured Only
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.specialChip,
                  filters.inStock && styles.selectedSpecialChip
                ]}
                onPress={() => updateFilter('inStock', !filters.inStock)}
              >
                <Ionicons 
                  name={filters.inStock ? "checkmark-circle" : "checkmark-circle-outline"} 
                  size={16} 
                  color={filters.inStock ? "#FFFFFF" : "#34C759"} 
                />
                <Text style={[
                  styles.specialChipText,
                  filters.inStock && styles.selectedSpecialChipText,
                ]}>
                  In Stock Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  clearText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedPriceButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priceButtonText: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  selectedPriceButtonText: {
    color: '#FFFFFF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
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
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  specialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedSpecialChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  specialChipText: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedSpecialChipText: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
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
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FilterModal;