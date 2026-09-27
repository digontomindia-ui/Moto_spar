import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderStatus = ({ orderStatus, deliveryDays, ordercreated, deliveryUpdated }) => {
  const calculateDeliveryDate = (deliveryDays) => {
    const currentDate = new Date(ordercreated); // Ensure valid Date
    currentDate.setDate(currentDate.getDate() + deliveryDays);
    return currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const deliveryDate = ordercreated
    ? calculateDeliveryDate(deliveryDays)
    : 'Unknown';

  const deliveryUpdate = deliveryUpdated
    ? new Date(deliveryUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown';

  const STATUS_STEPS = [
    { key: ['ADMIN_REVIEW', 'PENDING'], label: 'In Review' },
    { key: 'ASSIGNED_TO_VENDOR', label: 'Confirmed' },
    { key: 'VENDOR_ACCEPTED', label: 'In Transit' },
    {
      key: 'DELIVERED',
      label:
        orderStatus === 'DELIVERED'
          ? `Delivered on ${deliveryUpdate}`
          : `Delivery by ${deliveryDate}`,
    },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const currentStepIndex = STATUS_STEPS.findIndex((step) =>
    Array.isArray(step.key)
      ? step.key.includes(orderStatus)
      : step.key === orderStatus
  );

  const filteredSteps =
    orderStatus === 'CANCELLED'
      ? STATUS_STEPS.filter((step) =>
          ['Confirmed', 'Cancelled'].includes(step.label)
        )
      : STATUS_STEPS.filter((step) => step.label !== 'Cancelled');

  return (
    <View style={styles.container}>
      {filteredSteps.map((step, index) => (
        <View key={step.label} style={styles.stepContainer}>
          <View style={styles.circleContainer}>
            <View
              style={[
                styles.circle,
                index <= currentStepIndex
                  ? styles.circleActive
                  : styles.circleInactive,
              ]}
            />
            {index !== filteredSteps.length - 1 && (
              <View
                style={[
                  styles.verticalLine,
                  index < currentStepIndex
                    ? styles.lineActive
                    : styles.lineInactive,
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.label,
              index <= currentStepIndex
                ? styles.labelActive
                : styles.labelInactive,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  circleContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  circleActive: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  circleInactive: {
    backgroundColor: 'white',
    borderColor: 'gray',
  },
  verticalLine: {
    width: 2,
    height: 40, // Adjust this height to ensure proper spacing
  },
  lineActive: {
    backgroundColor: 'green',
  },
  lineInactive: {
    backgroundColor: 'gray',
  },
  label: {
    fontSize: 14,
  },
  labelActive: {
    color: 'green',
    fontWeight: 'bold',
  },
  labelInactive: {
    color: 'gray',
  },
});

export default OrderStatus;
