import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useStartScan() {
  return useMutation({ mutationFn: api.startScan });
}
