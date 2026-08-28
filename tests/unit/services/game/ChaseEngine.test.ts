import { ChaseEngine } from '@/services/game/ChaseEngine';
import type { Monster } from '@/types';
import { CHASE_DIFFICULTY_PRESETS } from '@/types/chase';
import { describe, expect, it } from 'vitest';

const createMonster = (name = 'Chaser'): Monster => ({
  id: 'm1',
  name,
  type: 'Beast',
  level: 1,
  description: 'Test chaser',
  image: 'chaser.png',
  hp: 100,
  maxHp: 100,
  weakness: ['endurance'],
  associatedExerciseIds: [],
  chaseSpeedKph: 10,
});
describe('ChaseEngine', () => {
  describe('Retrieval Methods', () => {
    it('getChaserMonsters should return only monsters with chaseSpeedKph', () => {
      const chasers = ChaseEngine.getChaserMonsters();
      // Using real data from MONSTERS
      expect(chasers.length).toBeGreaterThan(0);
      chasers.forEach((m) => {
        expect(m.chaseSpeedKph).toBeDefined();
      });
    });

    it('getRandomChaser should return one of the chasers', () => {
      const chaser = ChaseEngine.getRandomChaser();
      expect(chaser).not.toBeNull();
      expect(chaser?.chaseSpeedKph).toBeDefined();
    });
  });

  describe('initializeChase', () => {
    const mockMonster = createMonster('Chaser 1');

    it('should initialize with normal difficulty by default', () => {
      const state = ChaseEngine.initializeChase(mockMonster);
      const config = CHASE_DIFFICULTY_PRESETS.normal;

      expect(state.chaser).toEqual(mockMonster);
      expect(state.distanceGapMeters).toBe(config.startingGapMeters);
      expect(state.escapeDistanceMeters).toBe(config.escapeDistanceMeters);
      expect(state.isCaught).toBe(false);
      expect(state.hasEscaped).toBe(false);
      expect(state.elapsedSeconds).toBe(0);
    });
  });

  describe('updateChase', () => {
    const monster = createMonster();
    const initialState = ChaseEngine.initializeChase(monster, 'normal');

    it('should decrease gap if player is slower than chaser', () => {
      const state = ChaseEngine.updateChase(initialState, 5, 3600);
      expect(state.distanceGapMeters).toBe(-4900);
      expect(state.isCaught).toBe(true);
    });

    it('should increase gap if player is faster than chaser', () => {
      const state = ChaseEngine.updateChase(initialState, 15, 60);
      expect(state.distanceGapMeters).toBeCloseTo(183.33, 1);
      expect(state.isCaught).toBe(false);
    });

    it('should mark as escaped if gap exceeds escape distance', () => {
      const state = ChaseEngine.updateChase(initialState, 100, 3600);
      expect(state.hasEscaped).toBe(true);
      expect(state.distanceGapMeters).toBeGreaterThan(1500);
    });
  });

  describe('getDangerLevel', () => {
    const monster = createMonster();
    const state = ChaseEngine.initializeChase(monster, 'normal');

    it('should return 1 if caught', () => {
      expect(ChaseEngine.getDangerLevel({ ...state, isCaught: true })).toBe(1);
    });

    it('should return 0 if escaped', () => {
      expect(ChaseEngine.getDangerLevel({ ...state, hasEscaped: true })).toBe(0);
    });
  });

  describe('getStatusMessage', () => {
    const monster = createMonster();
    const state = ChaseEngine.initializeChase(monster, 'normal');

    it('should return caught message', () => {
      expect(ChaseEngine.getStatusMessage({ ...state, isCaught: true })).toContain('caught you');
    });

    it('should return escape message', () => {
      expect(ChaseEngine.getStatusMessage({ ...state, hasEscaped: true })).toContain('escaped');
    });
  });

  describe('getRequiredPace', () => {
    const monster = createMonster();
    const state = ChaseEngine.initializeChase(monster, 'normal');

    it('should return chaser speed with nightmare modifier', () => {
      const pace = ChaseEngine.getRequiredPace(state, 'nightmare');
      expect(pace).toBe(10 * CHASE_DIFFICULTY_PRESETS.nightmare.chaserSpeedModifier);
    });
  });
});
