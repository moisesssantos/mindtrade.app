import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type OpcaoCustomizada = {
  id: number
  campo: string
  opcao: string
  ordem: number
}

export function useOpcoes(campo: string, defaultOptions: string[]) {
  const queryClient = useQueryClient()

  // === GET ===
  const fetchOpcoes = async (): Promise<OpcaoCustomizada[]> => {
    try {
      const res = await fetch(`/api/opcoes/${campo}`)
      if (!res.ok) throw new Error(`Erro ao buscar opções de ${campo}`)
      return await res.json()
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const { data: opcoesCustomizadas = [] } = useQuery<OpcaoCustomizada[]>({
    queryKey: ["opcoes", campo],
    queryFn: fetchOpcoes,
    staleTime: 1000 * 60 * 5,
  })

  const opcoes = [
    ...defaultOptions,
    ...(opcoesCustomizadas ?? []).map((opt) => opt.opcao),
  ]

  // === ADD ===
  const addOpcaoMutation = useMutation({
    mutationFn: async (valor: string) => {
      const res = await fetch(`/api/opcoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campo, opcao: valor }),
      })
      if (!res.ok) throw new Error("Erro ao adicionar opção")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opcoes", campo] }),
  })
  const addOpcao = (valor: string) => addOpcaoMutation.mutate(valor)

  // === DELETE (usa ID) ===
  const deleteOpcaoMutation = useMutation({
  mutationFn: async (id: number) => {
    const res = await fetch(`/api/opcoes/${id}`, { method: "DELETE" })
    if (res.status === 204) return true // ✅ trata DELETE sem corpo
    if (!res.ok) throw new Error("Erro ao excluir opção")
    const ct = res.headers.get("content-type") || ""
    return ct.includes("application/json") ? res.json() : true
  },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opcoes", campo] }),
  })
  const deleteOpcao = (valor: string) => {
    const opcao = opcoesCustomizadas.find((opt) => opt.opcao === valor)
    if (opcao) deleteOpcaoMutation.mutate(opcao.id)
  }

  // === UPDATE (usa ID) ===
  const updateOpcaoMutation = useMutation({
    mutationFn: async ({ id, newValue }: { id: number; newValue: string }) => {
      const res = await fetch(`/api/opcoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opcao: newValue }),
      })
      if (!res.ok) throw new Error("Erro ao editar opção")
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opcoes", campo] }),
  })
  const updateOpcao = (oldValue: string, newValue: string) => {
    const opcao = opcoesCustomizadas.find((opt) => opt.opcao === oldValue)
    if (opcao) updateOpcaoMutation.mutate({ id: opcao.id, newValue })
  }

  // === Compatibilidade com outras telas ===
  const retorno = { opcoes, addOpcao, deleteOpcao, updateOpcao }
  Object.assign(opcoes, retorno)

  return opcoes as string[] & typeof retorno
}
