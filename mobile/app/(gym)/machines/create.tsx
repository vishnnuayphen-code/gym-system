import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { nebulaGold } from '../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../src/components/nebula/ScreenHeader';
import { FormField } from '../../../src/components/nebula/FormField';
import { GoldButton } from '../../../src/components/nebula/GoldButton';
import { SectionLabel } from '../../../src/components/nebula/SectionLabel';
import { Camera, Trash2, ArrowLeft, AlertCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { machineService } from '../../../src/services/machineService';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../../src/utils/toast';

const MACHINE_TYPES = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Accessory'];

export default function CreateMachineScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Strength');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationInGym, setLocationInGym] = useState('');
  const [image, setImage] = useState<{ uri: string; type: string; name: string } | null>(null);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const name = uri.split('/').pop() || 'machine_image.jpg';
      const type = `image/${name.split('.').pop() || 'jpeg'}`;
      setImage({ uri, type, name });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Machine name is required';
    if (!type.trim()) return 'Machine type is required';
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 1) return 'Quantity must be at least 1';
    return null;
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        type: type.trim(),
        description: description.trim(),
        quantity: parseInt(quantity),
        serialNumber: serialNumber.trim() || undefined,
        locationInGym: locationInGym.trim() || undefined,
        status: 'ACTIVE'
      };

      await machineService.create(payload, image || undefined);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Machine created successfully', 'success');
      router.back();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to create machine');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Add Machine" 
        showBack={true}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color="#E74C3C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Image Picker */}
          <SectionLabel label="MACHINE IMAGE" />
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => setImage(null)}
                >
                  <Trash2 color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color={nebulaGold.colors.gold.primary} size={32} />
                <Text style={styles.placeholderText}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionLabel label="BASIC INFORMATION" style={{ marginTop: 24 }} />
          <FormField
            label="Name *"
            placeholder="e.g. Treadmill Pro X1"
            value={name}
            onChangeText={setName}
          />
          <SectionLabel label="MACHINE TYPE *" />
          <View style={styles.typeContainer}>
            {MACHINE_TYPES.map(mType => (
              <TouchableOpacity
                key={mType}
                onPress={() => {
                  setType(mType);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.typePill,
                  type === mType && styles.activeTypePill
                ]}
              >
                <Text style={[
                  styles.typeText,
                  type === mType && styles.activeTypeText
                ]}>{mType}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FormField
            label="Custom Type (Optional)"
            placeholder="e.g. Boxing / Yoga"
            value={MACHINE_TYPES.includes(type) ? '' : type}
            onChangeText={setType}
          />
          <FormField
            label="Description"
            placeholder="Machine specifications..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Quantity *"
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 2 }}>
              <FormField
                label="Location"
                placeholder="e.g. Zone A"
                value={locationInGym}
                onChangeText={setLocationInGym}
              />
            </View>
          </View>

          <FormField
            label="Serial Number"
            placeholder="Unique identifier"
            value={serialNumber}
            onChangeText={setSerialNumber}
            autoCapitalize="characters"
          />

          <View style={styles.buttonGroup}>
            <View style={{ flex: 1 }}>
              <GoldButton 
                title="Cancel" 
                onPress={() => router.back()}
                variant="outline"
                disabled={loading}
              />
            </View>
            <View style={{ flex: 1 }}>
              <GoldButton 
                title="Save Machine" 
                onPress={handleCreate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: nebulaGold.colors.background.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  errorBanner: {
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    flex: 1,
  },
  imagePicker: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(201,168,76,0.3)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    color: nebulaGold.colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
  imagePreviewContainer: {
    flex: 1,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(231,76,60,0.8)',
    padding: 8,
    borderRadius: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cancelButtonText: {
    color: nebulaGold.colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  typePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.1)',
  },
  activeTypePill: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderColor: nebulaGold.colors.gold.primary,
  },
  typeText: {
    color: nebulaGold.colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  activeTypeText: {
    color: nebulaGold.colors.gold.primary,
    fontWeight: '700',
  },
});
