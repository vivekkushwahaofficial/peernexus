import { useQuery } from "@tanstack/react-query";
import { reputationService } from "../services/reputationService.js";

export function useMyReputation() {
  return useQuery({
    queryKey: ["reputation", "me"],
    queryFn: () => reputationService.getSummary(),
  });
}

export function useReputationHistory(params) {
  return useQuery({
    queryKey: ["reputation", "history", params],
    queryFn: () => reputationService.getHistory(params),
  });
}

export function useLeaderboard(params, options = {}) {
  return useQuery({
    queryKey: ["reputation", "leaderboard", params],
    queryFn: () => reputationService.getLeaderboard(params),
    ...options,
  });
}
