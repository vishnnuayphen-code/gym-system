import React from 'react';
import Animated, { 
  FadeInUp, 
  FadeOutDown 
} from 'react-native-reanimated';

interface NebulaTransitionProps {
  children: React.ReactNode;
}

export const NebulaTransition: React.FC<NebulaTransitionProps> = ({ children }) => {
  return (
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      exiting={FadeOutDown.duration(300)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
};
