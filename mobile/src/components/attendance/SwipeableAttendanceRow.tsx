import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Pencil, Trash2 } from 'lucide-react-native';

interface SwipeableAttendanceRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * TripGlide Swipeable Row - Light themed action buttons.
 */
export function SwipeableAttendanceRow({
  children, onEdit, onDelete
}: SwipeableAttendanceRowProps) {

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      {/* Edit action */}
      <TouchableOpacity
        onPress={onEdit}
        style={styles.editButton}
      >
        <Pencil size={18} color="#007AFF" />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>

      {/* Delete action */}
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
      >
        <Trash2 size={18} color="#FF3B30" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightActions: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    borderRadius: 16,
  },
  editText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '700',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FFEBEA',
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    borderRadius: 16,
  },
  deleteText: {
    fontSize: 10,
    color: '#FF3B30',
    fontWeight: '700',
    marginTop: 4,
  },
});
