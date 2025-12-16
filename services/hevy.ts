
import { HevyRoutine } from '../types/hevy';

// Uses the relative path so Vite proxy (dev) or same-origin (prod) handles the port forwarding
const API_URL = '/api/hevy'; 

export const getHevyRoutines = async (): Promise<HevyRoutine[]> => {
    try {
        const response = await fetch(`${API_URL}/routines`);
        if (!response.ok) throw new Error('Failed to fetch routines');
        
        const data = await response.json();
        // Hevy returnerar { page: 1, page_count: 1, workout_routines: [...] }
        return data.workout_routines || []; 
    } catch (error) {
        console.error("Hevy Service Error:", error);
        return [];
    }
};
