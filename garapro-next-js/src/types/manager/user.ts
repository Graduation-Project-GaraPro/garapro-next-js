export interface UserDto {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  gender?: string | null
  avatar?: string | null
  dateOfBirth?: string | null
}

export interface UserProfile extends UserDto {
  fullName: string
  initials: string
}