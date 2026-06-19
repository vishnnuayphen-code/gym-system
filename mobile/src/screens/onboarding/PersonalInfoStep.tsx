import React, { useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInYears } from 'date-fns';
import { nebulaGold } from '../../theme/nebulaGold';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OnboardingInput } from '../../components/onboarding/OnboardingInput';
import { SectionLabel } from '../../components/nebula/SectionLabel';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface PersonalInfoStepProps {
  onNext: () => void;
}

export const PersonalInfoStep = ({ onNext }: PersonalInfoStepProps) => {
  const { 
    firstName, lastName, dateOfBirth, phone, 
    emergencyContactName, emergencyContactPhone,
    updateData 
  } = useOnboardingStore();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const openDatePicker = () => {
    bottomSheetRef.current?.expand();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      updateData({ dateOfBirth: selectedDate.toISOString() });
    }
  };

  const validate = () => {
    const isNameValid = firstName.trim().length > 0 && lastName.trim().length > 0;
    const isPhoneValid = phone.trim().length >= 8;
    const isDOBValid = dateOfBirth ? differenceInYears(new Date(), new Date(dateOfBirth)) >= 16 : false;
    const isEmergencyValid = emergencyContactName.trim().length > 0 && emergencyContactPhone.trim().length >= 8;

    return isNameValid && isPhoneValid && isDOBValid && isEmergencyValid;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={8}
      title="Personal details"
      subtitle="We keep your information private and secure."
      onNext={handleNext}
      isNextDisabled={!validate()}
    >
      <View style={styles.form}>
        <OnboardingInput 
          label="First Name" 
          value={firstName} 
          onChangeText={(val) => updateData({ firstName: val })} 
          placeholder="Enter your first name"
        />
        <OnboardingInput 
          label="Last Name" 
          value={lastName} 
          onChangeText={(val) => updateData({ lastName: val })} 
          placeholder="Enter your last name"
        />
        
        <TouchableOpacity onPress={openDatePicker} activeOpacity={0.7}>
          <View pointerEvents="none">
            <OnboardingInput 
              label="Date of Birth" 
              value={dateOfBirth ? format(new Date(dateOfBirth), "dd MMM yyyy") : ""} 
              placeholder="Select your birth date"
              editable={false}
            />
          </View>
        </TouchableOpacity>

        <OnboardingInput 
          label="Phone Number" 
          value={phone} 
          onChangeText={(val) => updateData({ phone: val })} 
          placeholder="+1 234 567 890"
          keyboardType="phone-pad"
        />

        <SectionLabel label="Emergency Contact" />
        
        <OnboardingInput 
          label="Contact Name" 
          value={emergencyContactName} 
          onChangeText={(val) => updateData({ emergencyContactName: val })} 
          placeholder="Guardian or friend name"
        />
        <OnboardingInput 
          label="Contact Phone" 
          value={emergencyContactPhone} 
          onChangeText={(val) => updateData({ emergencyContactPhone: val })} 
          placeholder="+1 234 567 890"
          keyboardType="phone-pad"
        />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Date of Birth</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <DateTimePicker
            value={dateOfBirth ? new Date(dateOfBirth) : new Date(new Date().setFullYear(new Date().getFullYear() - 20))}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            textColor={nebulaGold.colors.text.primary}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
        </BottomSheetView>
      </BottomSheet>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingTop: 12,
  },
  bottomSheetBackground: {
    backgroundColor: nebulaGold.colors.background.secondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomSheetIndicator: {
    backgroundColor: nebulaGold.colors.background.tertiary,
    width: 48,
  },
  pickerContainer: {
    flex: 1,
    padding: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pickerTitle: {
    ...nebulaGold.typography.heading3,
    color: nebulaGold.colors.text.primary,
  },
  doneButton: {
    ...nebulaGold.typography.label,
    color: nebulaGold.colors.gold.primary,
    fontWeight: '700',
  },
  datePicker: {
    height: 200,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
