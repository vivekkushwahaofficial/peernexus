import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService.js";

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboardStats(),
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminService.submitReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

export function useReports(params) {
  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => adminService.listReports(params),
  });
}

export function useReport(id) {
  return useQuery({
    queryKey: ["admin", "report", id],
    queryFn: () => adminService.getReport(id),
    enabled: Boolean(id),
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, payload }) => adminService.reviewReport(reportId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "report", variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useApplyModerationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminService.applyModerationAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "actions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "auditLog"] });
    },
  });
}

export function useModerationActions(params) {
  return useQuery({
    queryKey: ["admin", "actions", params],
    queryFn: () => adminService.listActions(params),
  });
}

export function useUserModerationHistory(userId, params) {
  return useQuery({
    queryKey: ["admin", "actions", "user", userId, params],
    queryFn: () => adminService.listActionsByUser(userId, params),
    enabled: Boolean(userId),
  });
}

export function useAdminAuditLog(params) {
  return useQuery({
    queryKey: ["admin", "auditLog", params],
    queryFn: () => adminService.getAuditLog(params),
  });
}

export function useAdminAuditLogByActor(actorId, params) {
  return useQuery({
    queryKey: ["admin", "auditLog", "actor", actorId, params],
    queryFn: () => adminService.getAuditLogByActor(actorId, params),
    enabled: Boolean(actorId),
  });
}
