export interface User {
  name: string;
  surname: string;
  email: string;
  password: string; // Will be hashed before storing
  birth: string;
  uuid?: string; // Unique user identifier
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  birth: string;
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
  uuid?: string; // Unique user identifier (column F)
}


