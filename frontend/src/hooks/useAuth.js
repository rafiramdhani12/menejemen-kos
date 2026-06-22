import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Semua fungsi mutation wajib ditaruh di dalam properti mutationFn
    mutationFn: async ({ email, password }) => {
      const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
      return response.data;
    },
    // Format baru invalidateQueries di v5 wajib pakai objek queryKey
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log("Login sukses, data user didapat:", data);
    },
    onError: (error) => {
      console.error("Login gagal:", error.response?.data?.message || error.message);
    }
  });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
      // Semua fungsi mutation wajib ditaruh di dalam properti mutationFn
      mutationFn: async () => {
        const response = await api.post('/auth/logout', {}, { withCredentials: true });
        return response.data;
      },
      // Format baru invalidateQueries di v5 wajib pakai objek queryKey
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        console.log("Logout sukses, data user didapat:", data);
      },
      onError: (error) => {
        console.error("Logout gagal:", error.response?.data?.message || error.message);
      }
    })

}