import { useDailyStore } from './dailyStore';
import { useGameStore } from './store';

export const trackEvent = (event: 'LEVEL_WON' | 'BUILD_SUCCESS', data?: any) => {
  const ds = useDailyStore.getState();
  
  if (event === 'LEVEL_WON') {
    // data.isRevived
    ds.updateProgress('LEVELS_PLAYED', 1);
    
    if (data?.isRevived) {
      ds.updateProgress('BOOM_RECOVERY', 1);
    } else {
      ds.updateProgress('NO_BOOM', 1);
    }
  } else if (event === 'BUILD_SUCCESS') {
    ds.updateProgress('BUILD_COUNT', 1);
  }
};
