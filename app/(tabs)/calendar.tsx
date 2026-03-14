
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { loadState, saveState } from '@/utils/storage';
import { PlannerState } from '@/utils/plannerLogic';
import DayDetailModal from '@/components/DayDetailModal';
import { useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [state, setState] = useState<PlannerState | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const load = async () => {
        const s = await loadState();
        setState(s);
    };

    // Load on mount and focus
    useEffect(() => { load(); }, []);
    useFocusEffect(useCallback(() => { load(); }, []));

    // If we have items and just loaded, maybe jump to first item date? (Skipping for simplicity)

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentMonth(newDate);
    };

    const updatePlaceholder = (key: string, field: 'title' | 'link', value: string) => {
        if (!state) return;
        const meta = state.placeholders[key] || { title: "", link: "" };
        const newPlaceholders = {
            ...state.placeholders,
            [key]: { ...meta, [field]: value }
        };
        const newState = { ...state, placeholders: newPlaceholders };
        setState(newState);
        saveState(newState); // Auto-save
    };

    // Calendar Logic
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const startWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const monthLabel = monthStart.toLocaleString("en-US", { month: "long", year: "numeric" });

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push(dateStr);
    }

    const handleDayPress = (date: string) => {
        setSelectedDate(date);
        setModalVisible(true);
    };

    const screenWidth = Dimensions.get('window').width;
    const colWidth = (screenWidth - 32) / 7; // 32 for padding

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                    <FontAwesome name="chevron-left" size={16} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{monthLabel}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                    <FontAwesome name="chevron-right" size={16} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.gridHeader}>
                {WEEKDAYS.map(d => (
                    <Text key={d} style={[styles.dow, { width: colWidth }]}>{d}</Text>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {cells.map((date, idx) => {
                        if (!date) {
                            return <View key={`empty-${idx}`} style={{ width: colWidth, height: 80 }} />;
                        }

                        const dayItems = state?.items.filter(i => i.date === date) || [];
                        const hasStudy = dayItems.some(i => i.type === 'study');
                        const hasReview = dayItems.some(i => i.type === 'review');
                        const isToday = date === new Date().toISOString().split('T')[0];

                        return (
                            <TouchableOpacity
                                key={date}
                                style={[
                                    styles.dayCell,
                                    { width: colWidth, height: 80, borderColor: theme.border, backgroundColor: theme.panel },
                                    isToday && { borderColor: theme.tint, borderWidth: 1 }
                                ]}
                                onPress={() => handleDayPress(date)}
                            >
                                <Text style={[styles.dateNum, { color: theme.muted }]}>{parseInt(date.split('-')[2])}</Text>

                                <View style={styles.dots}>
                                    {hasStudy && <View style={[styles.dot, { backgroundColor: theme.tint }]} />}
                                    {hasReview && <View style={[styles.dot, { backgroundColor: theme.reviewText }]} />}
                                </View>

                                {dayItems.length > 0 && (
                                    <Text style={[styles.count, { color: theme.muted }]}>
                                        {dayItems.reduce((acc, i) => acc + i.placeholders.length, 0)} items
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {selectedDate && state && (
                <DayDetailModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    date={selectedDate}
                    items={state.items.filter(i => i.date === selectedDate)}
                    placeholders={state.placeholders}
                    onUpdatePlaceholder={updatePlaceholder}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthTitle: { fontSize: 18, fontWeight: 'bold' },
    navBtn: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8 },
    gridHeader: { flexDirection: 'row', marginBottom: 8 },
    dow: { textAlign: 'center', fontSize: 12, opacity: 0.5 },
    grid: {},
    dayCell: { padding: 4, borderWidth: 0.5, alignItems: 'center' },
    dateNum: { fontSize: 10, alignSelf: 'flex-end', marginBottom: 4 },
    dots: { flexDirection: 'row', gap: 4, marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    count: { fontSize: 8 }
});
