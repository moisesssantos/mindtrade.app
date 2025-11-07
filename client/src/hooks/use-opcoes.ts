import { useQuery } from "@tanstack/react-query";

type OpcaoCustomizada = {
  id: number;
  campo: string;
  opcao: string;
  ordem: number;
};

export function useOpcoes(campo: string, defaultOptions: string[] = []) {
  const { data: opcoesCustomizadas = [] } = useQuery<OpcaoCustomizada[]>({
    queryKey: [`/api/opcoes/${campo}`],
  });

  const safeDefaults = Array.isArray(defaultOptions) ? defaultOptions : [];

  const allOptions = [
    ...safeDefaults,
    ...opcoesCustomizadas.map(opt => opt.opcao),
  ];

  return allOptions;
}
