export interface Pedido {
  id: string
  clienteId: string
  clienteNombre: string
  productoId: string
  productoNombre: string
  cantidad: number
  fechaEntrega: string
  estado: "Pendiente" | "Entregado" | "Cancelado"
}
