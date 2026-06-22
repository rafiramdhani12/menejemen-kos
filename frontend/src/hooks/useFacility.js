// hooks/useFacility.js

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/axios";

export const useFacilities = () => {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data } = await api.get("/facilities", {
        withCredentials: true,
      });

      return data;
    },
  });
};

export const useCreateFacilities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facilityData) => {
      const { data } = await api.post(
        "/facilities",
        facilityData,
        {
          withCredentials: true,
        }
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["facilities"],
      });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }) => {
      const { data } = await api.put(
        `/facilities/${id}`,
        { name },
        {
          withCredentials: true,
        }
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["facilities"],
      });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(
        `/facilities/${id}`,
        {
          withCredentials: true,
        }
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["facilities"],
      });
    },
  });
};