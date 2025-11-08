import { useQuery } from "@tanstack/react-query"

type OpcaoCustomizada = {
  id: number
  campo: string
  opcao: string
  ordem: number
}

export function useOpcoes(campo: string, defaultOptions: string[]) {
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

  // Retorna um objeto com `opcoes` E o array diretamente (para retrocompatibilidade)
  Object.assign(opcoes, { opcoes })

  return opcoes as string[] & { opcoes: string[] }
}

