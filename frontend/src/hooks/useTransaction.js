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

export const usePayRent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload) => {
            const {data} = await api.post('/transactions/pay-rent' , payload ,{withCredentials:true})
            return data
        },
        onSuccess: (data,variables) => {
            queryClient.invalidateQueries({queryKey:['transactions']})
            queryClient.invalidateQueries({ queryKey: ['tenantDetail', variables.tenantId] });
        }
    })
}