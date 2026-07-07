import { useMutation } from "@tanstack/react-query";
import { aiService } from "../services/aiService.js";

/**
 * Custom React Query hook wrapping the AI explanation API call.
 */
export function useAIExplain() {
  return useMutation({
    mutationFn: (payload) => aiService.explain(payload),
  });
}
