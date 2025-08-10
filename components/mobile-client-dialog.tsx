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
import type { Cliente } from "@/types/cliente"

export interface MobileClientDialogProps {
  cliente: Cliente
  onClose: () => void
  // Solo campos editables, sin id
  onSave: (data: Pick<Cliente, "nombre" | "telefono" | "direccion">) => void | Promise<void>
}

export function MobileClientDialog({ cliente, onClose, onSave }: MobileClientDialogProps) {
  const [formData, setFormData] = useState({
    nombre: cliente.nombre ?? "",
    telefono: cliente.telefono ?? "",   // 👈 siempre string
    direccion: cliente.direccion ?? "", // 👈 siempre string
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim() ? formData.telefono.trim() : null,     // "" → null
      direccion: formData.direccion.trim() ? formData.direccion.trim() : null,  // "" → null
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>✏️</span>
            Editar Cliente
          </DialogTitle>
          <DialogDescription>Modifica los datos de {cliente.nombre}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="h-12 text-lg rounded-xl border-2"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-base font-medium">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono} // 👈 ya no puede ser null
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="h-12 text-lg rounded-xl border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-base font-medium">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion} // 👈 ya no puede ser null
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="h-12 text-lg rounded-xl border-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-12 rounded-xl bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="h-12 rounded-xl bg-blue-500 hover:bg-blue-600">
              💾 Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
