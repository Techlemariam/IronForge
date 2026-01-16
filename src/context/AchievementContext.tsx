import { createContext, useContext } from "react";

export interface AchievementContextType {
  unlockAchievement: (id: string) => void;
  unlockedIds: Set<string>;
}

export const AchievementContext = createContext<AchievementContextType | null>(
  null,
);

export const useAchievementContext = () => {
  const context = useContext(AchievementContext);
  return context;
};
