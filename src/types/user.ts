export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface SessionUser extends User {
  username: string;
  npm?: string;
  organizationalCode?: string;
}
