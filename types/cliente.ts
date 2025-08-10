// types/cliente.ts

export interface Cliente {
  id: number;                 
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
}

export interface ClienteCreate {
  nombre: string
  telefono?: string | null
  direccion?: string | null
}
