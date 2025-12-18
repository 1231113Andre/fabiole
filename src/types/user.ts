export interface User {
  name: string;
  surname: string;
  email: string;
  password: string; // Will be hashed before storing
  birth: string;
  age?: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  birth: string;
  age?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface InfoDataRow {
  name: string;
  surname: string;
  email: string;
  password: string;
  birth: string;
  age?: string;
}

