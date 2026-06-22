import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData) => {
      const response = await api.post('/rooms/add', roomData, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    }
  });
};

export const useGetAvailable = () => {
  return useQuery({
    key: ['roomsIsAvailable'],
    queryFn: async () => {
      const response = await api.get('/rooms/available', { withCredentials: true });
      return response.data;
    }
  });
};

// FIX 1: Terima argumen 'id' di hook dan masukkan ke queryKey serta URL
export const useRoomById = (id) => {
  return useQuery({
    queryKey: ['roomDetail', id], // Sertakan id di queryKey agar cache-nya spesifik per kamar
    queryFn: async () => {
      // Menggunakan backtick (``) agar :id diganti dengan value variabel id asli
      const response = await api.get(`/rooms/${id}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!id, // Hanya jalankan query jika id-nya valid (bukan undefined)
  });
};

// FIX 2: Terima objek parameter { id, ...roomData } di mutationFn
export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...roomData }) => {
      // Menggunakan backtick (``) untuk URL dinamis
      const response = await api.put(`/rooms/${id}`, roomData, { withCredentials: true });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate list rooms global DAN detail room yang barusan di-update biar datanya fresh
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['roomDetail', variables.id] });
    }
  });
};

export const useGetRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await api.get('/rooms', { withCredentials: true });
      return response.data;
    }
  });
};

export const useDeleteRooms = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/rooms/${id}` , {withCredentials:true})
      return response.data
    },
     onSuccess: (data, id) => {
      // 1. Refresh list semua kamar
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      // 2. Hapus cache detail kamar yang barusan dihapus
      queryClient.removeQueries({ queryKey: ['roomDetail', id] });
    }
  })
}