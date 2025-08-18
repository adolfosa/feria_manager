// /types/pedido.ts
export type EstadoPedido = "Pendiente" | "Entregado" | "Cancelado"

export interface Pedido {
  id: number
  user_id: number
  cliente_id: number
  cliente_nombre: string
  producto_id: number
  producto_nombre: string
  cantidad: number
  fecha_entrega: string // YYYY-MM-DD
  estado: EstadoPedido
}
