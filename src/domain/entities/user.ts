export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  avatarInitials: string;
  color: string;
}

export interface AuthSession {
  user: User;
  familyId: string;
  sharedLogin: boolean;
}
