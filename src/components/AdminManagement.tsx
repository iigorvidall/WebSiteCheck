"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription  } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash } from 'lucide-react'

interface Administrator {
  id: number
  nome: string
  email: string
  numero?: string
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Administrator[]>([])
  const [newAdmin, setNewAdmin] = useState({ nome: '', email: '', numero: '' })
  const [editingAdmin, setEditingAdmin] = useState<Administrator | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<Administrator | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin')
      if (!response.ok) {
        throw new Error('Failed to fetch administrators')
      }
      const data = await response.json()
      setAdmins(data)
    } catch (error) {
      console.error('Error fetching administrators:', error)
      toast({
        title: "Erro",
        description: "Falha ao carregar os administradores. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (editingAdmin) {
      setEditingAdmin({ ...editingAdmin, [name]: value })
    } else {
      setNewAdmin({ ...newAdmin, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin)
      } else {
        await createAdmin(newAdmin)
      }
      await fetchAdmins()
      setNewAdmin({ nome: '', email: '', numero: '' })
      setEditingAdmin(null)
      setIsDialogOpen(false)
      toast({
        title: "Sucesso",
        description: editingAdmin ? "Administrador atualizado com sucesso!" : "Administrador adicionado com sucesso!",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error submitting administrator:', error)
      toast({
        title: "Erro",
        description: `Falha ao ${editingAdmin ? 'atualizar' : 'adicionar'} administrador. Por favor, tente novamente.`,
        variant: "destructive",
      })
    }
  }

  const createAdmin = async (admin: Omit<Administrator, 'id'>) => {
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    })
    if (!response.ok) {
      throw new Error('Failed to create administrator')
    }
  }

  const updateAdmin = async (admin: Administrator) => {
    const response = await fetch(`/api/admin/${admin.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    })
    if (!response.ok) {
      throw new Error('Failed to update administrator')
    }
  }

  const handleDelete = (admin: Administrator) => {
    setAdminToDelete(admin);
  };

  const confirmDelete = async () => {
    if (adminToDelete) {
      try {
        const response = await fetch(`/api/admin/${adminToDelete.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete administrator');
        }
        await fetchAdmins();
        toast({
          title: "Sucesso",
          description: "Administrador removido com sucesso!",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error deleting administrator:', error);
        toast({
          title: "Erro",
          description: "Falha ao remover administrador. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
      setAdminToDelete(null);
    }
  };

  return (
    <Card className="w-full max-w-7xl max-h-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Gerenciar Administradores</CardTitle>
          <CardDescription>Adicione, edite ou remova administradores do sistema</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Administrador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAdmin ? 'Editar Administrador' : 'Adicionar Novo Administrador'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="nome"
                placeholder="Nome"
                value={editingAdmin ? editingAdmin.nome : newAdmin.nome}
                onChange={handleInputChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={editingAdmin ? editingAdmin.email : newAdmin.email}
                onChange={handleInputChange}
                required
              />
              <Input
                type="tel"
                name="numero"
                placeholder="Número (opcional)"
                value={editingAdmin ? editingAdmin.numero || '' : newAdmin.numero}
                onChange={handleInputChange}
              />
              <Button type="submit">{editingAdmin ? 'Atualizar' : 'Adicionar'} Administrador</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.nome}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.numero || '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => {
                    setEditingAdmin(admin)
                    setIsDialogOpen(true)
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Dialog open={!!adminToDelete} onOpenChange={(open) => !open && setAdminToDelete(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" onClick={() => handleDelete(admin)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja excluir o administrador {adminToDelete?.nome}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setAdminToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

