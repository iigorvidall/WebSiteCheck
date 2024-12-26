"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import RegisterClientSite from "./site-register"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Pencil, Trash, Loader2 } from 'lucide-react'
import { Status } from "@prisma/client"
import { AdminManagement } from "./AdminManagement"

interface ClientSite {
  id: number
  status: Status
  clientName: string
  clientUrl: string
  keywords: string[]
  numero: string
  email: string
  latency?: string
  responseTime?: string
  emailEnvied: boolean
}

export default function SiteVerifier() {
  const [clientSites, setClientSites] = useState<ClientSite[]>([])
  const [filteredSites, setFilteredSites] = useState<ClientSite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<ClientSite | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sitesPerPage = 5
  const { toast } = useToast()
  const [siteToDelete, setSiteToDelete] = useState<ClientSite | null>(null);
  const [activeCard, setActiveCard] = useState<"clients" | "form">("clients")

  const fetchClientSites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/client-site");
      if (!response.ok) {
        throw new Error('Failed to fetch client sites');
      }
      const data = await response.json();
      setClientSites(data);
      setFilteredSites(data);
    } catch (error) {
      console.error('Error fetching client sites:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar os sites dos clientes. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientSites();
  }, []);

  useEffect(() => {
    const filtered = clientSites
      .filter((site) => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = site.clientName.toLowerCase().includes(searchTermLower);
        const keywordsMatch = site.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTermLower)
        );
        const urlMatch = site.clientUrl.toLowerCase().includes(searchTermLower);
        const statusMatch = statusFilter === "all" || site.status.toLowerCase() === statusFilter.toLowerCase();
        return (nameMatch || keywordsMatch || urlMatch) && statusMatch;
      })
      .sort((a, b) => {
        if (a.status === Status.ONLINE && b.status === Status.OFFLINE) return -1;
        if (a.status === Status.OFFLINE && b.status === Status.ONLINE) return 1;
        return 0;
      });
  
    setFilteredSites(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, clientSites]);

  const indexOfLastSite = currentPage * sitesPerPage
  const indexOfFirstSite = indexOfLastSite - sitesPerPage
  const currentSites = filteredSites.slice(indexOfFirstSite, indexOfLastSite)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleSuccess = async () => {
    await fetchClientSites()
    setIsDialogOpen(false)
    setEditingSite(null)
    toast({
      title: "Sucesso",
      description: "Operação realizada com sucesso!",
      duration: 3000,
    })
  }

  const handleEdit = (site: ClientSite) => {
    setEditingSite(site)
    setIsDialogOpen(true)
  }

  const handleDelete = (site: ClientSite) => {
    setSiteToDelete(site);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (siteToDelete) {
      try {
        const response = await fetch(`/api/client-site/${siteToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchClientSites();
          toast({
            title: "Sucesso",
            description: "Site deletado com sucesso!",
            duration: 3000,
          });
        } else {
          throw new Error("Falha ao deletar o site");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao deletar o site. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsDialogOpen(false);
        setSiteToDelete(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 font-sans p-6">
      <div className="w-full max-w-7xl mx-auto mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border text-stone-700 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-gray-400 focus:text-stone-700
            ${activeCard === 'clients' 
              ? 'bg-gray-100 text-stone-700 ' 
              : 'bg-white text-stone-700 hover:bg-gray-100 hover:text-stone-700'}`}
            onClick={() => setActiveCard("clients")}
          >
            Sites
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border text-stone-700 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-gray-400 focus:text-stone-700
            ${activeCard === 'form' 
              ? 'bg-gray-100 text-stone-700 '
              : 'bg-white text-stone-700 hover:bg-gray-100 hover:text-stone-700'}`}
            onClick={() => setActiveCard("form")}
          >
            Configurações
          </button>
        </div>
      </div>
      {activeCard === "clients" ? (
        <Card className="w-full max-w-7xl max-h-6xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">VERIFICADOR DE SITES</CardTitle>
              <CardDescription>Coloque aqui os sites que você deseja verificar o status</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingSite(null);
                setSiteToDelete(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>Adicionar novo site</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {siteToDelete ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Confirmar exclusão</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja excluir o site {siteToDelete.clientName}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>{editingSite ? "Editar site" : "Adicionar novo site"}</DialogTitle>
                      <DialogDescription>
                        {editingSite ? "Edite os detalhes do site cliente aqui." : "Preencha os detalhes do novo site cliente aqui."}
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterClientSite onSuccess={handleSuccess} editingSite={editingSite} />
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <Input
                type="text"
                placeholder="Buscar por nome do cliente, palavra-chave ou URL"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Carregando dados...</span>
              </div>
            ) : (
              <>
                {currentSites.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tempo médio de carregamento</TableHead>
                        <TableHead>Site (URL)</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentSites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${site.status === Status.ONLINE ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                          </TableCell>
                          <TableCell>{site.clientName}</TableCell>
                          <TableCell>{site.responseTime ? `${site.responseTime} ms` : '-'}</TableCell>
                          <TableCell>
                            <a href={site.clientUrl} target="_blank" rel="noopener noreferrer">
                              {site.clientUrl}
                            </a>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(site)}>
                                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                  <span className="text-blue-500">Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(site)}>
                                  <Trash className="mr-2 h-4 w-4 text-red-500" />
                                  <span className="text-red-500">Apagar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-lg text-gray-500">Não há registros adicionados.</p>
                  </div>
                )}
                <div className="flex justify-center space-x-2 mt-4">
  {(() => {
    const totalPages = Math.ceil(filteredSites.length / sitesPerPage);
    const visibleButtons = 9; // Total de botões visíveis
    const halfVisible = Math.floor(visibleButtons / 2); // Metade visível de cada lado

    // Determinar o início e o fim do intervalo
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(currentPage + halfVisible, totalPages);

    // Ajustar o intervalo se estiver próximo ao início ou ao fim
    if (currentPage <= halfVisible) {
      endPage = Math.min(visibleButtons, totalPages);
    } else if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(totalPages - visibleButtons + 1, 1);
    }

    // Gerar os botões de paginação dentro do intervalo
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
      <Button
        key={page}
        variant={currentPage === page ? "default" : "outline"}
        onClick={() => paginate(page)}
      >
        {page}
      </Button>
    ));
  })()}
</div>

              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <AdminManagement />
      )}
    </div>
  )
}

