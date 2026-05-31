import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData) => {
      // Menembak rute POST untuk buat kamar baru
      const response = await api.post('/rooms/add', roomData, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      // Reset cache rooms biar dashboard & data kamar langsung terupdate otomatis
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }
  });
};

export const useGetAvailable = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['roomsIsAvailable'],
    queryFn: async () => {
      const response = await api.get('/rooms/available', { withCredentials: true });
      return response.data;
    }
  })
}

export const useGetRooms = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms', { withCredentials: true });
      return response.data;
    }
  });
}