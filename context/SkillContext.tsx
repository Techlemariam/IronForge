
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { SKILL_TREE } from '../data';
import { calculateTitanRank, calculateAdaptiveCost, playSound } from '../utils';
import { IntervalsWellness } from '../types';
import { StorageService } from '../services/storage';

interface SkillContextType {
  purchasedSkillIds: Set<string>;
  availableTalentPoints: number;
  availableKineticShards: number;
  unlockSkill: (skillId: string) => void;
  canAfford: (skillId: string) => boolean;
  isLoading: boolean;
}

const SkillContext = createContext<SkillContextType | null>(null);

export const useSkills = () => {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
};

interface SkillProviderProps {
  children: React.ReactNode;
  unlockedAchievementIds: Set<string>;
  wellness: IntervalsWellness | null;
}

export const SkillProvider: React.FC<SkillProviderProps> = ({ children, unlockedAchievementIds, wellness }) => {
  const [purchasedSkillIds, setPurchasedSkillIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load from DB
  useEffect(() => {
    const loadSkills = async () => {
        try {
            await StorageService.init();
            const saved = await StorageService.getState<string[]>('skills');
            if (saved) {
                setPurchasedSkillIds(new Set(saved));
            }
        } catch (e) {
            console.error("Skill load failed", e);
        } finally {
            setIsLoading(false);
        }
    };
    loadSkills();
  }, []);

  // Calculate Total Resources (Earned from Achievements)
  const { talentPoints: totalTP, kineticShards: totalKS } = useMemo(() => 
    calculateTitanRank(unlockedAchievementIds), 
  [unlockedAchievementIds]);

  // Calculate Spent Resources (Sum of purchased skills)
  const { spentTP, spentKS } = useMemo(() => {
    let tp = 0;
    let ks = 0;
    purchasedSkillIds.forEach(id => {
      const node = SKILL_TREE.find(n => n.id === id);
      if (node) {
        // NOTE: We use the *base* cost for historical calculation consistency. 
        if (node.currency === 'talent_point') tp += node.cost;
        if (node.currency === 'kinetic_shard') ks += node.cost;
      }
    });
    return { spentTP: tp, spentKS: ks };
  }, [purchasedSkillIds]);

  const availableTalentPoints = totalTP - spentTP;
  const availableKineticShards = totalKS - spentKS;

  const unlockSkill = (skillId: string) => {
    if (purchasedSkillIds.has(skillId)) return;
    
    const node = SKILL_TREE.find(n => n.id === skillId);
    if (!node) return;
    
    // Check affordability using ADAPTIVE cost (Current moment penalty)
    const { cost } = calculateAdaptiveCost(node, wellness);
    
    if (node.currency === 'talent_point' && availableTalentPoints < cost) {
        playSound('fail');
        return;
    }
    if (node.currency === 'kinetic_shard' && availableKineticShards < cost) {
        playSound('fail');
        return;
    }

    playSound('loot_epic'); // Success sound

    setPurchasedSkillIds(prev => {
      if (prev.has(skillId)) return prev;
      const next = new Set(prev);
      next.add(skillId);
      
      // Save Async
      StorageService.saveState('skills', Array.from(next)).catch(console.error);
      
      return next;
    });
  };

  const canAfford = (skillId: string) => {
    const node = SKILL_TREE.find(n => n.id === skillId);
    if (!node) return false;
    
    const { cost } = calculateAdaptiveCost(node, wellness);

    if (node.currency === 'talent_point') return availableTalentPoints >= cost;
    if (node.currency === 'kinetic_shard') return availableKineticShards >= cost;
    return false;
  };

  return (
    <SkillContext.Provider value={{
      purchasedSkillIds,
      availableTalentPoints,
      availableKineticShards,
      unlockSkill,
      canAfford,
      isLoading
    }}>
      {children}
    </SkillContext.Provider>
  );
};
