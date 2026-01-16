import api from '@/lib/api';

export const trackingService = {
  async recordPageView(path: string): Promise<void> {
    try {
      await api.post('/tracking/pageview', { path });
    } catch (error) {
      // Silently fail - tracking should not interrupt user experience
      console.debug('Failed to record page view:', error);
    }
  },
};

export default trackingService;
