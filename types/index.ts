export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  accessToken?: string;
}

export interface Session {
  user: User;
  expires: string;
}
