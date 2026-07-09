import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CreateLogInput } from "./api";

export const QUERY_KEYS = {
  logs: ["study-logs"] as const,
  analytics: ["analytics"] as const,
  goal: ["goal"] as const,
};

export function useStudyLogs() {
  return useQuery({ queryKey: QUERY_KEYS.logs, queryFn: api.getLogs });
}

export function useAnalytics() {
  return useQuery({ queryKey: QUERY_KEYS.analytics, queryFn: api.getAnalytics });
}

export function useGoal() {
  return useQuery({ queryKey: QUERY_KEYS.goal, queryFn: api.getGoal });
}

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.logs });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.analytics });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.goal });
  };
}

export function useCreateLog() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (data: CreateLogInput) => api.createLog(data),
    onSuccess: invalidate,
  });
}

export function useDeleteLog() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: number) => api.deleteLog(id),
    onSuccess: invalidate,
  });
}

export function useClearLogs() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: () => api.clearLogs(),
    onSuccess: invalidate,
  });
}

export function useUpdateGoal() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (hours: number) => api.updateGoal(hours),
    onSuccess: invalidate,
  });
}
