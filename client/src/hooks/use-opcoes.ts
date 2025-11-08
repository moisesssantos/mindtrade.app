import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

type OpcaoCustomizada = {
  id: number
  campo: string
  opcao: string
  ordem: number
}

export function useOpcoes(campo: string, defaultOptions: string[]) {
  const queryClient = useQueryClient()

  // --- Leitura das opções ---
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

  // --- Adicionar nova opção ---
  const addOpcaoMutation = useMutation({
    mutationFn: async (valor: string) => {
      const body = { campo, opcao: valor }
      const res = await fetch(`/api/opcoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Erro ao adicionar opção")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opcoes", campo] })
    },
  })

  const addOpcao = (valor: string) => addOpcaoMutation.mutate(valor)

  // --- Excluir opção ---
  const deleteOpcaoMutation = useMutation({
    mutationFn: async (valor: string) => {
      const res = await fetch(`/api/opcoes/${campo}/${encodeURIComponent(valor)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erro ao excluir opção")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opcoes", campo] })
    },
  })

  const deleteOpcao = (valor: string) => deleteOpcaoMutation.mutate(valor)

  // --- Compatibilidade com as duas telas ---
  const retorno = {
    opcoes,
    addOpcao,
    deleteOpcao,
  }

  Object.assign(opcoes, retorno)

  return opcoes as string[] & typeof retorno
}
