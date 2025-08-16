"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Producto } from "@/types/producto"

export interface MobileProductDialogProps {
  producto: Producto
  onClose: () => void
  // Solo los campos editables; el id no se toca
  onSave: (data: Pick<Producto, "nombre" | "cantidad">) => void | Promise<void>
}

export function MobileProductDialog({ producto, onClose, onSave }: MobileProductDialogProps) {
  const [formData, setFormData] = useState({
    nombre: producto.nombre ?? "",
    cantidad: String(producto.cantidad ?? 0), // mantener como string para el input controlado
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombre = formData.nombre.trim()
    const cantidadNum = Number(formData.cantidad)

    if (!nombre) return
    if (!Number.isFinite(cantidadNum) || cantidadNum < 0) return

    await onSave({
      nombre,            // el backend hará toLowerCase()
      cantidad: cantidadNum,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>✏️</span>
            Editar Producto
          </DialogTitle>
          <DialogDescription>Modifica los datos de {producto.nombre}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre del Producto *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="h-12 text-lg rounded-xl border-2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad" className="text-base font-medium">
                Cantidad *
              </Label>
              <Input
                id="cantidad"
                type="number"
                min={0}
                step={1}
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                className="h-12 text-lg rounded-xl border-2"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="h-12 rounded-xl bg-purple-500 hover:bg-purple-600">
              💾 Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}