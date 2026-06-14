import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupService } from "../services/groupService.js";

export function useGroups(params) {
  return useQuery({
    queryKey: ["groups", params],
    queryFn: () => groupService.listGroups(params),
  });
}

export function useSearchGroups(q, params) {
  return useQuery({
    queryKey: ["groups", "search", q, params],
    queryFn: () => groupService.searchGroups(q, params),
    enabled: typeof q === "string",
  });
}

export function useMyGroups(params) {
  return useQuery({
    queryKey: ["myGroups", params],
    queryFn: () => groupService.getMyGroups(params),
  });
}

export function useGroup(id) {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => groupService.getGroup(id),
    enabled: Boolean(id),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => groupService.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => groupService.updateGroup(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.id] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
}

export function useUploadGroupImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => groupService.uploadGroupImage(id, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group", variables.id] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupService.joinGroup(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", id] });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupService.leaveGroup(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", id] });
    },
  });
}

export function useGroupMembers(groupId, params = {}, options = {}) {
  return useQuery({
    queryKey: ["groupMembers", groupId, params],
    queryFn: () => groupService.getMembers(groupId, params),
    enabled: Boolean(groupId) && (options.enabled ?? true),
  });
}

export function useRemoveMember(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => groupService.removeMember(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
}

export function usePromoteToAdmin(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => groupService.promoteToAdmin(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
    },
  });
}

export function useTransferOwnership(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => groupService.transferOwnership(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
}

export function useRequestToJoinGroup(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables) => {
      const finalId = variables?.id || groupId;
      const finalBody = variables?.body !== undefined ? variables.body : variables;
      return groupService.requestToJoin(finalId, finalBody);
    },
    onSuccess: (data, variables) => {
      const finalId = variables?.id || groupId;
      queryClient.invalidateQueries({ queryKey: ["group", finalId] });
      queryClient.invalidateQueries({ queryKey: ["myJoinRequests"] });
    },
  });
}

export function usePendingJoinRequests(groupId, params = {}, options = {}) {
  return useQuery({
    queryKey: ["pendingJoinRequests", groupId, params],
    queryFn: () => groupService.getPendingRequests(groupId, params),
    enabled: Boolean(groupId) && (options.enabled ?? true),
  });
}

export function useApproveJoinRequest(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => groupService.approveRequest(groupId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingJoinRequests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });
}

export function useRejectJoinRequest(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => groupService.rejectRequest(groupId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingJoinRequests", groupId] });
    },
  });
}

export function useMyJoinRequests(params) {
  return useQuery({
    queryKey: ["myJoinRequests", params],
    queryFn: () => groupService.getMyRequests(params),
  });
}
