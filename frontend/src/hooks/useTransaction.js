import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useGetTransactions = () => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await api.get('/transactions', { withCredentials: true });
            return response.data;
        }
    });
};