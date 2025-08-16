export interface Producto {
  id: number          // BIGINT en MySQL -> lo convertimos a number
  nombre: string
  cantidad: number
}

export interface ProductoCreate {
  nombre: string
  cantidad: number
}
