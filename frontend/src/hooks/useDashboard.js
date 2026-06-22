import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useGetAvailable = () => {
    const queryClient = useQueryClient();

    return useQuery ({
        queryKey: ['roomsAvailable'],
        queryFn: async () => {
            const response = await api.get('/dashboard/available', { withCredentials: true });
            return response.data;
        }
    })
}

export const useGetOccupied = () => {
    const queryClient = useQueryClient();

    return useQuery ({
        queryKey: ['roomsOccupied'],
        queryFn: async () => {
            const response = await api.get('/dashboard/occupied', { withCredentials: true });
            return response.data;
        }
    })
}

export const useGetAllRooms = () => {
    const queryClient = useQueryClient();

    return useQuery ({
        queryKey: ['allRooms'],
        queryFn: async () => {
            const response = await api.get('/dashboard/all-rooms', { withCredentials: true });
            return response.data;
        }
    })
}

export const useGetOmzet = () => {
    const queryClient = useQueryClient();

    return useQuery ({
        queryKey: ['omzet'],
        queryFn: async () => {
            const response = await api.get('/dashboard/omzet', { withCredentials: true });
            return response.data;
        }
    })
}

export const useGetRecentActivity = () => {
    const queryClient = useQueryClient();

    return useQuery ({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            const response = await api.get('/dashboard/recent-activity', { withCredentials: true });
            return response.data;
        }
    })
}