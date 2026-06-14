import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chatService.js";

export function useChatRooms() {
  return useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => chatService.getMyRooms(),
  });
}

export function useChatHistory(roomId, params) {
  return useQuery({
    queryKey: ["chatHistory", roomId, params],
    queryFn: () => chatService.getHistory(roomId, params),
    enabled: Boolean(roomId),
  });
}

export function useOrCreateChatRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId) => chatService.getOrCreateRoom(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId) => chatService.markAsRead(roomId),
    onSuccess: (data, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      queryClient.invalidateQueries({ queryKey: ["chatHistory", roomId] });
    },
  });
}
