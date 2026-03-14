
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { loadState, saveState } from '@/utils/storage';
import { PlanItem, PlannerState, PlaceholderMeta } from '@/utils/plannerLogic';
import DayDetailModal from '@/components/DayDetailModal';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlanScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [state, setState] = useState<PlannerState | null>(null);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const load = async () => {
        const s = await loadState();
        setState(s);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);
    useFocusEffect(useCallback(() => { load(); }, []));

    const handleRowPress = (date: string) => {
        setSelectedDate(date);
        setModalVisible(true);
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
        saveState(newState); // Auto-save on edit
    };

    const renderItem = ({ item }: { item: PlanItem }) => {
        const isReview = item.type === "review";
        const displayTitles = item.placeholders.map(ph => {
            const meta = state?.placeholders[ph];
            return (meta && meta.title) ? meta.title : ph;
        }).join(", ");

        return (
            <TouchableOpacity onPress={() => handleRowPress(item.date)}>
                <View style={[styles.row, { borderBottomColor: theme.border }]}>
                    <View style={styles.dateCol}>
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                    <View style={styles.typeCol}>
                        <View style={[
                            styles.pill,
                            { backgroundColor: isReview ? theme.reviewBg : theme.studyBg, borderColor: isReview ? theme.reviewLine : theme.studyLine, borderWidth: 1 }
                        ]}>
                            <Text style={[styles.pillText, { color: isReview ? theme.reviewText : theme.studyText }]}>
                                {isReview ? "Rev" : "Study"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.contentCol}>
                        <Text style={[styles.contentText, { color: theme.text }]} numberOfLines={2}>
                            {displayTitles}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading || !state) return <ActivityIndicator style={{ marginTop: 50 }} />;

    const modalItems = selectedDate ? state.items.filter(i => i.date === selectedDate) : [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]}>Your Plan</Text>
            </View>
            <FlatList
                data={state.items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListEmptyComponent={<Text style={styles.empty}>No plan generated yet. Go to Settings.</Text>}
            />

            {selectedDate && (
                <DayDetailModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    date={selectedDate}
                    items={modalItems}
                    placeholders={state.placeholders}
                    onUpdatePlaceholder={updatePlaceholder}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    title: { fontSize: 24, fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 50, opacity: 0.5 },
    row: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, alignItems: 'center' },
    dateCol: { width: 95 },
    dateText: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
    typeCol: { width: 70 },
    pill: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8, alignSelf: 'flex-start' },
    pillText: { fontSize: 11, fontWeight: 'bold' },
    contentCol: { flex: 1 },
    contentText: { fontSize: 13 }
});
