import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupChatService } from "../services/groupChatService.js";

export function useGroupChatHistory(groupId, params) {
  return useQuery({
    queryKey: ["groupChatHistory", groupId, params],
    queryFn: () => groupChatService.getHistory(groupId, params),
    enabled: Boolean(groupId),
  });
}

export function useSendGroupMessageREST(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => groupChatService.sendMessage(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupChatHistory", groupId] });
    },
  });
}

export function useMarkGroupAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId) => groupChatService.markAsRead(groupId),
    onSuccess: (data, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["groupChatHistory", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupUnreadCount", groupId] });
    },
  });
}

export function useGroupUnreadCount(groupId) {
  return useQuery({
    queryKey: ["groupUnreadCount", groupId],
    queryFn: () => groupChatService.getUnreadCount(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupLastMessage(groupId) {
  return useQuery({
    queryKey: ["groupLastMessage", groupId],
    queryFn: () => groupChatService.getLastMessage(groupId),
    enabled: Boolean(groupId),
  });
}
