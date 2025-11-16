import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';

interface DateFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: string | null) => void; // null = 全て表示
  selectedDate: string | null;
  markedDates: string[]; // メダルのある日付のリスト
}

export const DateFilterModal: React.FC<DateFilterModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  markedDates,
}) => {
  /**
   * カレンダーのマーク設定を生成
   */
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    // メダルのある日付をマーク
    markedDates.forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: '#1E88E5',
      };
    });

    // 選択中の日付をハイライト
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#1E88E5',
      };
    }

    return marked;
  };

  /**
   * 日付選択時の処理
   */
  const handleDayPress = (day: DateData) => {
    onSelectDate(day.dateString);
    onClose();
  };

  /**
   * 「全て表示」ボタン
   */
  const handleShowAll = () => {
    onSelectDate(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>日付でフィルター</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#424242" />
            </TouchableOpacity>
          </View>

          {/* カレンダー */}
          <Calendar
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
            theme={{
              todayTextColor: '#1E88E5',
              selectedDayBackgroundColor: '#1E88E5',
              selectedDayTextColor: '#FFFFFF',
              arrowColor: '#1E88E5',
              monthTextColor: '#212121',
              textMonthFontWeight: 'bold',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />

          {/* フッター */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.showAllButton}
              onPress={handleShowAll}
            >
              <Text style={styles.showAllButtonText}>全て表示</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  showAllButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  showAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
