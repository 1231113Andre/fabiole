export interface User {
  id?: string;
  email: string;
  password: string; // Will be hashed before storing
  name: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

