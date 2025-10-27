import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  username: string;
  permissions: string[];
}

interface UsePermissionsResult {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isLoading: boolean;
  error: Error | null;
}

export function usePermissions(): UsePermissionsResult {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await apiClient.get('/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const permissions = user?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission =>
      permissions.includes(permission) ||
      permissions.some(p => p.startsWith(permission.split(':')[0] + ':*'))
    );
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    isLoading,
    error,
  };
}