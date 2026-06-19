import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChooseCoachStep } from '../screens/trainee/booking/ChooseCoachStep';
import { PickSlotStep } from '../screens/trainee/booking/PickSlotStep';
import { SessionDetailsStep } from '../screens/trainee/booking/SessionDetailsStep';
import { ConfirmBookingStep } from '../screens/trainee/booking/ConfirmBookingStep';
import { BookingSuccessScreen } from '../screens/trainee/booking/BookingSuccessScreen';
import { useBookingStore } from '../stores/bookingStore';

const Stack = createNativeStackNavigator();

export const BookingNavigator = () => {
  const { currentStep, setStep, selectedCoach } = useBookingStore();

  return (
    <Stack.Navigator 
      initialRouteName={selectedCoach ? 'PickSlot' : 'ChooseCoach'}
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="ChooseCoach">
        {(props) => <ChooseCoachStep {...props} onNext={() => {
          setStep(2);
          props.navigation.navigate('PickSlot');
        }} />}
      </Stack.Screen>
      
      <Stack.Screen name="PickSlot">
        {(props) => <PickSlotStep {...props} onNext={() => {
          setStep(3);
          props.navigation.navigate('SessionDetails');
        }} />}
      </Stack.Screen>

      <Stack.Screen name="SessionDetails">
        {(props) => <SessionDetailsStep {...props} onNext={() => {
          setStep(4);
          props.navigation.navigate('ConfirmBooking');
        }} />}
      </Stack.Screen>

      <Stack.Screen name="ConfirmBooking">
        {(props) => <ConfirmBookingStep {...props} onNext={() => {
          props.navigation.navigate('BookingSuccess');
        }} />}
      </Stack.Screen>

      <Stack.Screen 
        name="BookingSuccess" 
        component={BookingSuccessScreen} 
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};
