export type UserRole = 'CHILD' | 'PARENT' | 'EDUCATOR' | 'ADMIN'

export type User = {
  id: string
  authProviderId: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  childProfiles?: ChildProfile[]
}

export type ChildProfile = {
  id: string
  name: string
  avatarUrl: string | null
  dateOfBirth: Date | null
  preferredLang: string
  userId: string
}

export type GuardianRelationship = {
  id: string
  guardianId: string
  childProfileId: string
  relationshipType: string
}