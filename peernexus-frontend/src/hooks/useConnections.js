import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "../services/connectionService.js";

export function useConnections(params) {
  return useQuery({
    queryKey: ["connections", params],
    queryFn: () => connectionService.getConnections(params),
  });
}

export function useIncomingRequests(params) {
  return useQuery({
    queryKey: ["connections", "incoming", params],
    queryFn: () => connectionService.getIncomingRequests(params),
  });
}

export function useOutgoingRequests(params) {
  return useQuery({
    queryKey: ["connections", "outgoing", params],
    queryFn: () => connectionService.getOutgoingRequests(params),
  });
}

export function useMutualConnections(userId) {
  return useQuery({
    queryKey: ["connections", "mutual", userId],
    queryFn: () => connectionService.getMutualConnections(userId),
    enabled: Boolean(userId),
  });
}

export function useSendConnectionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipientId) => connectionService.sendRequest(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useAcceptConnectionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => connectionService.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useRejectConnectionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => connectionService.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useCancelConnectionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => connectionService.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}

export function useRemoveConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => connectionService.removeConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
