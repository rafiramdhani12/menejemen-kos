import { useQuery } from '@tanstack/react-query';
import {api} from '../lib/axios';

export const useGetTenantDetail = (id) => {
  return useQuery({
    queryKey: ['tenant-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
