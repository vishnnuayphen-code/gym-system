import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { nebulaGold } from '../../../../src/theme/nebulaGold';
import { ScreenHeader } from '../../../../src/components/nebula/ScreenHeader';
import { FormField } from '../../../../src/components/nebula/FormField';
import { GoldButton } from '../../../../src/components/nebula/GoldButton';
import { SectionLabel } from '../../../../src/components/nebula/SectionLabel';
import { Camera, Trash2, ArrowLeft, AlertCircle, Info, Edit2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { machineService, Machine } from '../../../../src/services/machineService';
import * as Haptics from 'expo-haptics';
import { showToast } from '../../../../src/utils/toast';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Retired', value: 'RETIRED' },
];

export default function EditMachineScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationInGym, setLocationInGym] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'RETIRED'>('ACTIVE');
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(undefined);
  const [newImage, setNewImage] = useState<{ uri: string; type: string; name: string } | null>(null);

  useEffect(() => {
    loadMachine();
  }, [id]);

  const loadMachine = async () => {
    try {
      const data = await machineService.getById(id as string);
      setName(data.name);
      setType(data.type);
      setDescription(data.description || '');
      setQuantity(data.quantity.toString());
      setSerialNumber((data as any).serialNumber || '');
      setLocationInGym((data as any).locationInGym || '');
      setStatus(data.status);
      setExistingImageUrl(data.imageUrl);
    } catch (e: any) {
      setError(e.message || 'Failed to load machine data');
    } finally {
      setLoading(false);
    }
  };

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
      setNewImage({ uri, type, name });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError('Machine name is required');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        type: type.trim(),
        description: description.trim(),
        quantity: parseInt(quantity),
        serialNumber: serialNumber.trim() || undefined,
        locationInGym: locationInGym.trim() || undefined,
        status: status
      };

      // 1. Update machine details
      await machineService.update(id as string, payload);

      // 2. Upload image if changed
      if (newImage) {
        await machineService.uploadImage(id as string, newImage);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Machine updated successfully', 'success');
      router.back();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to update machine');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Machine" showBack={true} />
        <View style={styles.center}>
          <ActivityIndicator color={nebulaGold.colors.gold.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Edit Machine" 
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
            {newImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: newImage.uri }} style={styles.imagePreview} />
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => setNewImage(null)}
                >
                  <Trash2 color="#FFF" size={16} />
                </TouchableOpacity>
              </View>
            ) : existingImageUrl ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/files/${existingImageUrl}` }} 
                  style={styles.imagePreview} 
                />
                <View style={styles.editOverlay}>
                  <Camera color="#FFF" size={24} />
                  <Text style={styles.editText}>Change Photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color={nebulaGold.colors.gold.primary} size={32} />
                <Text style={styles.placeholderText}>Upload Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <SectionLabel label="STATUS" style={{ marginTop: 24 }} />
          <View style={styles.statusGroup}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  setStatus(opt.value as any);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.statusPill,
                  status === opt.value && { 
                    backgroundColor: opt.value === 'ACTIVE' ? 'rgba(46,204,113,0.2)' : 
                                    opt.value === 'MAINTENANCE' ? 'rgba(243,156,18,0.2)' : 'rgba(231,76,60,0.2)',
                    borderColor: opt.value === 'ACTIVE' ? '#2ECC71' : 
                                opt.value === 'MAINTENANCE' ? '#F39C12' : '#E74C3C'
                  }
                ]}
              >
                <Text style={[
                  styles.statusText,
                  status === opt.value && { 
                    color: opt.value === 'ACTIVE' ? '#2ECC71' : 
                          opt.value === 'MAINTENANCE' ? '#F39C12' : '#E74C3C',
                    fontWeight: '700'
                  }
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionLabel label="BASIC INFORMATION" style={{ marginTop: 24 }} />
          <FormField
            label="Name *"
            placeholder="e.g. Treadmill Pro X1"
            value={name}
            onChangeText={setName}
          />
          <FormField
            label="Type *"
            placeholder="e.g. Cardio / Strength"
            value={type}
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
                disabled={submitting}
              />
            </View>
            <View style={{ flex: 1 }}>
              <GoldButton 
                title="Update Machine" 
                onPress={handleUpdate}
                loading={submitting}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: nebulaGold.colors.gold.primary,
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
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: nebulaGold.colors.gold.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadgeText: {
    color: nebulaGold.colors.background.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(231,76,60,0.8)',
    padding: 8,
    borderRadius: 20,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statusText: {
    fontSize: 12,
    color: nebulaGold.colors.text.secondary,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    alignItems: 'center',
  },
});
