import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

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
        dotColor: COLORS.PRIMARY,
      };
    });

    // 選択中の日付をハイライト
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: COLORS.PRIMARY,
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
              todayTextColor: COLORS.PRIMARY,
              selectedDayBackgroundColor: COLORS.PRIMARY,
              selectedDayTextColor: COLORS.BACKGROUND,
              arrowColor: COLORS.PRIMARY,
              monthTextColor: COLORS.TEXT_PRIMARY,
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
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.XLARGE,
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
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  showAllButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  showAllButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.MEDIUM,
    fontWeight: 'bold',
  },
});
