import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useRegisterTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantData) => {
      // Menembak rute POST tenant ke backend Express
      const response = await api.post('/tenants/add', tenantData, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache biar list data penghuni/dashboard langsung terupdate otomatis
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });
};

export const useGetTenants = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get('/tenants', { withCredentials: true });
      return response.data;
    }
  });
};

export const useGetTenantById = (tenantId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const response = await api.get(`/tenants/${tenantId}`, { withCredentials: true });
      return response.data;
    }
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post('/tenants/record-payment', paymentData, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache biar list data penghuni/dashboard langsung terupdate otomatis
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });
};