import { apiClient } from './api-client'
import type { UserDto, UserProfile } from '@/types/manager/user'

export class UserService {
  static async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get('/users/me')
    const userData = response.data as UserDto
    
    // Transform the data to include computed fields
    return {
      ...userData,
      fullName: `${userData.firstName} ${userData.lastName}`.trim(),
      initials: `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}`.toUpperCase()
    }
  }
}