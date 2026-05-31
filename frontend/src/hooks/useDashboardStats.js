import { useQuery } from '@tanstack/react-query';
import {api} from '../lib/axios';

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    },
  });
};
