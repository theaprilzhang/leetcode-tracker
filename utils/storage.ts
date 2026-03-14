import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlannerState, defaultState } from './plannerLogic';

const STORAGE_KEY = "@lc_planner_state_v1";

export async function saveState(state: PlannerState) {
    try {
        const json = JSON.stringify(state);
        await AsyncStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
        console.error("Failed to save state", e);
    }
}

export async function loadState(): Promise<PlannerState> {
    try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
            const parsed = JSON.parse(json);
            // Merge with default state to ensure structure is correct
            return { ...defaultState(), ...parsed };
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
    return defaultState();
}
