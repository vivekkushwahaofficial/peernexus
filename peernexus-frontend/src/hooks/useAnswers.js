import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { answerService } from "../services/answerService.js";

export function useAnswersByDoubt(doubtId, params) {
  return useQuery({
    queryKey: ["answers", doubtId, params],
    queryFn: () => answerService.getByDoubt(doubtId, params),
    enabled: Boolean(doubtId),
  });
}

export function useCreateAnswer(doubtId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => answerService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", doubtId] });
      queryClient.invalidateQueries({ queryKey: ["doubt", doubtId] });
    },
  });
}

export function useUpdateAnswer(doubtId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => answerService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", doubtId] });
      queryClient.invalidateQueries({ queryKey: ["answer", variables.id] });
    },
  });
}

export function useDeleteAnswer(doubtId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => answerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", doubtId] });
      queryClient.invalidateQueries({ queryKey: ["doubt", doubtId] });
    },
  });
}

export function useAcceptAnswer(doubtId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => answerService.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", doubtId] });
      queryClient.invalidateQueries({ queryKey: ["doubt", doubtId] });
    },
  });
}

export function useVoteAnswer(doubtId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type }) => answerService.vote(id, type),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", doubtId] });
      queryClient.invalidateQueries({ queryKey: ["answer", variables.id] });
    },
  });
}
