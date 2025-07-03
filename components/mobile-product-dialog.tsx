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

interface Producto {
  id: string
  nombre: string
  cantidad: number
}

interface MobileProductDialogProps {
  producto: Producto
  onClose: () => void
  onSave: (producto: Producto) => void
}

export function MobileProductDialog({ producto, onClose, onSave }: MobileProductDialogProps) {
  const [formData, setFormData] = useState({
    nombre: producto.nombre,
    cantidad: producto.cantidad.toString(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...producto,
      nombre: formData.nombre,
      cantidad: Number.parseInt(formData.cantidad),
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
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
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
