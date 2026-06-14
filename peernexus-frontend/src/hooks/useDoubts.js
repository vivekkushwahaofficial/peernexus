import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doubtService } from "../services/doubtService.js";

export function useDoubts(params, options = {}) {
  return useQuery({
    queryKey: ["doubts", params],
    queryFn: () => doubtService.getAll(params),
    ...options,
  });
}

export function useDoubt(id) {
  return useQuery({
    queryKey: ["doubt", id],
    queryFn: () => doubtService.getById(id),
    enabled: Boolean(id),
  });
}

export function useDoubtSearch(query, params, options = {}) {
  return useQuery({
    queryKey: ["doubts", "search", query, params],
    queryFn: () => doubtService.search(query, params),
    enabled: typeof query === "string" && Boolean(query.trim()),
    ...options,
  });
}

export function useDoubtsByCategory(categoryId, params, options = {}) {
  return useQuery({
    queryKey: ["doubts", "category", categoryId, params],
    queryFn: () => doubtService.getByCategory(categoryId, params),
    enabled: Boolean(categoryId),
    ...options,
  });
}

export function useCreateDoubt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => doubtService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doubts"] });
    },
  });
}

export function useUpdateDoubt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => doubtService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doubts"] });
      queryClient.invalidateQueries({ queryKey: ["doubt", variables.id] });
    },
  });
}

export function useDeleteDoubt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => doubtService.delete(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["doubts"] });
      queryClient.invalidateQueries({ queryKey: ["doubt", id] });
    },
  });
}

export function useUploadDoubtImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageUrls }) => doubtService.uploadImages(id, imageUrls),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doubt", variables.id] });
    },
  });
}
