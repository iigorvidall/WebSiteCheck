"use client"
import React, { useState, useEffect } from "react"
import { Status } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ClientSite {
  id: number
  status: Status
  clientName: string
  clientUrl: string
  keywords: string[]
  emailEnvied?: boolean
}

interface FormErrors {
  clientName?: string
  clientUrl?: string
  status?: string
  keywords?: string
  general?: string
}

interface RegisterClientSiteProps {
  editingSite?: ClientSite | null
  onSuccess?: () => void
}

const RegisterClientSite: React.FC<RegisterClientSiteProps> = ({ 
  editingSite = null, 
  onSuccess = () => {} 
}) => {
  const [formData, setFormData] = useState<{
    clientName: string
    clientUrl: string
    status: Status
    keywords: string
  }>({
    clientName: "",
    clientUrl: "",
    status: Status.ONLINE,
    keywords: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [keywordsArray, setKeywordsArray] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as Status }))
    setErrors(prev => ({ ...prev, status: undefined }))
  }

  // Função para adicionar palavras-chave ao pressionar Enter ou espaço
  const handleKeywordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const newKeyword = formData.keywords.trim();
      if (newKeyword && !keywordsArray.includes(newKeyword)) {
        setKeywordsArray((prev) => [...prev, newKeyword]);
      }
      setFormData((prev) => ({ ...prev, keywords: "" }));
    }
  };

  // Função para remover uma palavra-chave
  const removeKeyword = (keywordToRemove: string) => {
    setKeywordsArray((prev) => prev.filter((keyword) => keyword !== keywordToRemove));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {}
    if (!formData.clientName.trim()) newErrors.clientName = "Nome do cliente é obrigatório"
    if (!formData.clientUrl.trim()) newErrors.clientUrl = "URL do cliente é obrigatória"
    if (!formData.status) newErrors.status = "Status é obrigatório"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      const clientSiteData = { ...formData, keywords: keywordsArray };
  
      try {
        const url = editingSite ? `/api/client-site/${editingSite.id}` : "/api/client-site";
        const method = editingSite ? "PATCH" : "POST";
  
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientSiteData),
        });
  
        if (response.ok) {
          setFormData({
            clientName: "",
            clientUrl: "",
            status: Status.OFFLINE,
            keywords: "",
          });
          setKeywordsArray([]);
          toast({
            title: "Sucesso",
            description: editingSite ? "Cliente atualizado com sucesso!" : "Cliente criado com sucesso!",
          });
          onSuccess();
        } else {
          const errorData = await response.json();
          setErrors({ general: errorData.message || "Ocorreu um erro ao processar sua solicitação." });
        }
      } catch (error) {
        setErrors({ general: "Erro ao enviar dados. Tente novamente." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  useEffect(() => {
    if (editingSite) {
      setFormData({
        clientName: editingSite.clientName,
        clientUrl: editingSite.clientUrl,
        status: editingSite.status,
        keywords: "", // Deixe o input vazio ao carregar
      });
      setKeywordsArray(editingSite.keywords); // Popula o estado com as keywords existentes
    }
  }, [editingSite]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
        />
        {errors.clientName && <p className="text-red-500 text-sm">{errors.clientName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientUrl">URL do Cliente</Label>
        <Input
          id="clientUrl"
          name="clientUrl"
          type="url"
          placeholder="https://example.com"
          value={formData.clientUrl}
          onChange={handleChange}
          required
        />
        {errors.clientUrl && <p className="text-red-500 text-sm">{errors.clientUrl}</p>}
      </div>
      <div className="space-y-2">
      <Label htmlFor="keywords">Keywords</Label>
    <Input
      id="keywords"
      name="keywords"
      value={formData.keywords}
      onChange={handleChange}
      onKeyDown={handleKeywordInput}
      placeholder="Digite uma palavra e pressione Enter ou Espaço"
    />
    <div className="flex flex-wrap gap-2">
      {keywordsArray.map((keyword, index) => (
      <div
        key={index}
        className="bg-gray-200 text-sm px-2 py-1 rounded flex items-center"
      >
        {keyword}
        <button
          type="button"
          className="ml-2 text-red-500 hover:text-red-700"
          onClick={() => removeKeyword(keyword)}
        >
          &times;
        </button>
      </div>
       ))}
    </div>
    {errors.keywords && <p className="text-red-500 text-sm">{errors.keywords}</p>}
      </div>
      {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : (editingSite ? 'Atualizar' : 'Salvar')}
      </Button>
    </form>
  )
}

export default RegisterClientSite

