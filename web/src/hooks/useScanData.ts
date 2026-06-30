import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useScanData() {
  return useQuery({ queryKey: ['data'], queryFn: api.getData });
}
