import {View, Text} from 'react-native';
import React from 'react';
import StepIndicator from 'react-native-step-indicator';
import Colors from '../../constants/Colors';

const ProgressSteps = ({screen}) => {
  const labels = ['Cart', 'Delivery Address', 'Payment Method'];
  return (
    <View >
      <StepIndicator
        currentPosition={screen}
        customStyles={{
          stepIndicatorSize: 25,
          currentStepIndicatorSize: 40,
          separatorStrokeWidth: 2,
        }}
        labels={labels}
        stepCount={3}
        renderStepIndicator={() => <View />}
      />
    </View>
  );
};

export default ProgressSteps;
