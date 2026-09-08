import { create } from 'zustand';

export interface DailyTask {
  id: string;
  type: 'LOGIN' | 'LEVELS_PLAYED' | 'NO_BOOM' | 'BUILD_COUNT' | 'BOOM_RECOVERY';
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  rewardClaimed: boolean;
}

interface DailyStore {
  currentDateStr: string;
  tasks: DailyTask[];
  bonusClaimed: boolean;
  initDaily: () => void;
  updateProgress: (type: DailyTask['type'], amount: number) => void;
  claimReward: (taskId: string) => void;
  claimBonus: () => void;
}

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const generateTasks = (): DailyTask[] => {
  return [
    {
      id: 'task-login',
      type: 'LOGIN',
      title: '🌞 DAILY VISIT',
      description: 'Open the game today',
      target: 1,
      progress: 0,
      reward: 150,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-levels',
      type: 'LEVELS_PLAYED',
      title: '🏗 CAMPAIGNER',
      description: 'Complete 3 levels',
      target: 3,
      progress: 0,
      reward: 300,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-survivor',
      type: 'NO_BOOM',
      title: '🛡 SURVIVOR',
      description: 'Complete 2 levels without a BOOM',
      target: 2,
      progress: 0,
      reward: 300,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-builder',
      type: 'BUILD_COUNT',
      title: '🧱 MASTER BUILDER',
      description: 'Successfully build 20 blocks',
      target: 20,
      progress: 0,
      reward: 300,
      completed: false,
      rewardClaimed: false
    },
    {
      id: 'task-recovery',
      type: 'BOOM_RECOVERY',
      title: '🔄 RESILIENCE',
      description: 'Complete a level after a previous BOOM',
      target: 1,
      progress: 0,
      reward: 150,
      completed: false,
      rewardClaimed: false
    }
  ];
};

const loadDailyData = () => {
  try {
    const data = localStorage.getItem('buildOrBoomDaily');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) { }
  return null;
};

const saveDailyData = (data: any) => {
  localStorage.setItem('buildOrBoomDaily', JSON.stringify(data));
};

export const useDailyStore = create<DailyStore>((set, get) => {
  return {
    currentDateStr: '',
    tasks: [],
    bonusClaimed: false,
    
    initDaily: () => {
      const today = getTodayStr();
      const saved = loadDailyData();
      if (saved && saved.currentDateStr === today) {
        set({ currentDateStr: saved.currentDateStr, tasks: saved.tasks, bonusClaimed: saved.bonusClaimed });
      } else {
        const newTasks = generateTasks();
        const newState = { currentDateStr: today, tasks: newTasks, bonusClaimed: false };
        saveDailyData(newState);
        set(newState);
        // Trigger LOGIN task immediately
        setTimeout(() => get().updateProgress('LOGIN', 1), 100);
      }
    },
    
    updateProgress: (type, amount) => {
      const state = get();
      if (state.currentDateStr !== getTodayStr()) {
        state.initDaily();
        return; // Will apply on next update
      }
      
      let changed = false;
      const newTasks = state.tasks.map(t => {
        if (t.type === type && !t.completed) {
          const newProgress = Math.min(t.target, t.progress + amount);
          if (newProgress !== t.progress) {
            changed = true;
            return {
              ...t,
              progress: newProgress,
              completed: newProgress >= t.target
            };
          }
        }
        return t;
      });
      
      if (changed) {
        saveDailyData({ currentDateStr: state.currentDateStr, tasks: newTasks, bonusClaimed: state.bonusClaimed });
        set({ tasks: newTasks });
      }
    },
    
    claimReward: (taskId) => {
      const state = get();
      let changed = false;
      const newTasks = state.tasks.map(t => {
        if (t.id === taskId && t.completed && !t.rewardClaimed) {
          changed = true;
          return { ...t, rewardClaimed: true };
        }
        return t;
      });
      if (changed) {
        saveDailyData({ currentDateStr: state.currentDateStr, tasks: newTasks, bonusClaimed: state.bonusClaimed });
        set({ tasks: newTasks });
      }
    },
    
    claimBonus: () => {
      const state = get();
      if (!state.bonusClaimed) {
        saveDailyData({ currentDateStr: state.currentDateStr, tasks: state.tasks, bonusClaimed: true });
        set({ bonusClaimed: true });
      }
    }
  };
});
