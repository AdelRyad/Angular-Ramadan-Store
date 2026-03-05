export type Role = 'user' | 'admin' | 'visitor';

export interface User {
  username: string;
  role: Role;
}
