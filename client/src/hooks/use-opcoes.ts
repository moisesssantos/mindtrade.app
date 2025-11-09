import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // usa a base configurada

type OpcaoCustomizada = {
  id: number;
  campo: string;
  opcao: string;
  ordem: number;
};

/**
 * Hook para buscar e gerenciar opções personalizadas (estadoEmocional, motivacaoEntrada etc.)
 */
export function useOpcoes(campo: string, defaultOptions: string[]) {
  const queryClient = useQueryClient();

  // === GET ===
  const fetchOpcoes = async (): Promise<OpcaoCustomizada[]> => {
    try {
      const res = await apiRequest(`/api/opcoes/${campo}`, "GET");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Erro ao buscar opções:", err);
      return [];
    }
  };

  const { data: opcoesCustomizadas = [] } = useQuery<OpcaoCustomizada[]>({
    queryKey: [`/api/opcoes/${campo}`], // ✅ usa o caminho completo e coerente
    queryFn: fetchOpcoes,
    staleTime: 1000 * 60 * 5,
  });

  const opcoes = [
    ...defaultOptions,
    ...(opcoesCustomizadas ?? []).map((opt) => opt.opcao),
  ];

  // === ADD ===
  const addOpcaoMutation = useMutation({
    mutationFn: async (valor: string) => {
      const res = await apiRequest(`/api/opcoes`, "POST", {
        campo,
        opcao: valor,
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] }),
  });
  const addOpcao = (valor: string) => addOpcaoMutation.mutate(valor);

  // === DELETE ===
  const deleteOpcaoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/opcoes/${id}`, "DELETE");
      if (res.status === 204) return true;
      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? res.json() : true;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] }),
  });
  const deleteOpcao = (valor: string) => {
    const opcao = opcoesCustomizadas.find((opt) => opt.opcao === valor);
    if (opcao) deleteOpcaoMutation.mutate(opcao.id);
  };

  // === UPDATE ===
  const updateOpcaoMutation = useMutation({
    mutationFn: async ({
      id,
      newValue,
    }: {
      id: number;
      newValue: string;
    }) => {
      const res = await apiRequest(`/api/opcoes/${id}`, "PUT", {
        opcao: newValue,
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] }),
  });
  const updateOpcao = (oldValue: string, newValue: string) => {
    const opcao = opcoesCustomizadas.find((opt) => opt.opcao === oldValue);
    if (opcao) updateOpcaoMutation.mutate({ id: opcao.id, newValue });
  };

  // === Compatibilidade ===
  const retorno = { opcoes, addOpcao, deleteOpcao, updateOpcao };
  Object.assign(opcoes, retorno);

  return opcoes as string[] & typeof retorno;
}
