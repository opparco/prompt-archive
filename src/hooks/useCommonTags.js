import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const useCommonTags = () => {
  return useQuery({
    queryKey: ['commonTags'],
    queryFn: apiClient.getCommonTags,
  });
}; 