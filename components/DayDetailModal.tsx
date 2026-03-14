
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { Text, View } from './Themed';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { PlanItem, PlaceholderMeta } from '@/utils/plannerLogic';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DayDetailModalProps {
    visible: boolean;
    onClose: () => void;
    date: string;
    items: PlanItem[];
    placeholders: Record<string, PlaceholderMeta>;
    onUpdatePlaceholder: (key: string, field: 'title' | 'link', value: string) => void;
}

export default function DayDetailModal({ visible, onClose, date, items, placeholders, onUpdatePlaceholder }: DayDetailModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const studyItems = items.filter(i => i.type === 'study');
    const reviewItems = items.filter(i => i.type === 'review');

    const studyPhs = studyItems.flatMap(i => i.placeholders);
    const reviewPhs = reviewItems.flatMap(i => i.placeholders);

    const getMeta = (ph: string) => placeholders[ph] || { title: '', link: '' };

    const openLink = (url: string) => {
        if (url) Linking.openURL(url).catch(() => { });
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.panel }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>{date}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <FontAwesome name="times" size={20} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Study Section */}
                    {studyItems.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.dot, { backgroundColor: theme.tint }]} />
                                <Text style={styles.sectionTitle}>Study (Editable)</Text>
                            </View>
                            {studyPhs.map(ph => {
                                const meta = getMeta(ph);
                                return (
                                    <View key={ph} style={[styles.editRow, { backgroundColor: theme.panel2, borderColor: theme.border }]}>
                                        <Text style={styles.phLabel}>{ph}</Text>
                                        <View style={styles.inputs}>
                                            <TextInput
                                                style={[styles.input, { color: theme.text, borderColor: theme.border, marginBottom: 6 }]}
                                                placeholder="Title (e.g. Two Sum)"
                                                placeholderTextColor={theme.icon}
                                                value={meta.title}
                                                onChangeText={t => onUpdatePlaceholder(ph, 'title', t)}
                                            />
                                            <TextInput
                                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                                placeholder="Link (http://...)"
                                                placeholderTextColor={theme.icon}
                                                value={meta.link}
                                                autoCapitalize="none"
                                                onChangeText={t => onUpdatePlaceholder(ph, 'link', t)}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Review Section */}
                    {reviewItems.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.dot, { backgroundColor: theme.reviewText }]} />
                                <Text style={styles.sectionTitle}>Review (Read-only)</Text>
                            </View>
                            <View style={styles.chipContainer}>
                                {reviewPhs.map(ph => {
                                    const meta = getMeta(ph);
                                    const title = meta.title || ph;
                                    const hasLink = !!meta.link;
                                    return (
                                        <TouchableOpacity
                                            key={ph}
                                            disabled={!hasLink}
                                            onPress={() => openLink(meta.link)}
                                            style={[styles.chip, { backgroundColor: theme.reviewBg, borderColor: theme.reviewLine }]}
                                        >
                                            <Text style={[styles.chipText, { color: theme.reviewText }]}>
                                                {title} {hasLink && "↗"}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {items.length === 0 && (
                        <Text style={{ textAlign: 'center', color: theme.muted, marginTop: 20 }}>No items for this date.</Text>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 8 },
    content: { padding: 16 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '600', opacity: 0.7 },
    editRow: { flexDirection: 'row', padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8, alignItems: 'flex-start' },
    phLabel: { width: 40, fontSize: 12, fontWeight: 'bold', paddingTop: 8, opacity: 0.5 },
    inputs: { flex: 1 },
    input: { borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, fontSize: 13, backgroundColor: 'rgba(0,0,0,0.02)' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    chipText: { fontSize: 12, fontWeight: '600' }
});
