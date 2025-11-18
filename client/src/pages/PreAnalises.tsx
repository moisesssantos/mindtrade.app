import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock, PlayCircle } from "lucide-react";

type Partida = {
  id: number;
  data: string;
  hora: string;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  status: string;
  justificativaNaoOperada: string | null;
  dataVerificacaoNaoOperada: string | null;
};

type PreAnalise = {
  partidaId: number;
  classificacaoM: string;
  classificacaoV: string;
  tendenciaEsperada: string;
  destaqueEssencial: string;
};

type PreAnaliseComPartida = {
  preAnalise: PreAnalise;
  partida: Partida;
};

type Equipe = {
  id: number;
  nome: string;
};

type Competicao = {
  id: number;
  nome: string;
};

export default function PreAnalises() {
  // ✅ Detectar modo escuro/claro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Queries
  const { data: preAnalisesComPartidas = [], isLoading } =
    useQuery<PreAnaliseComPartida[]>({
      queryKey: ["/api/pre-analises/com-partidas"],
    });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ["/api/equipes"],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ["/api/competicoes"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Pré-Análises
        </h1>
        <p className="text-muted-foreground mt-1">
          Histórico de todas as pré-análises realizadas
        </p>
      </div>

      {preAnalisesComPartidas.length === 0 ? (
        <Card
          className={
            isDarkMode
              ? "bg-[#2a2b2e] border border-[#44494d] shadow-sm"
              : "bg-white border border-gray-200 shadow-sm"
          }
        >
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma pré-análise encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {preAnalisesComPartidas.map(({ preAnalise, partida }) => {
            const mandante =
              equipes.find((e) => e.id === partida.mandanteId)?.nome || "";
            const visitante =
              equipes.find((e) => e.id === partida.visitanteId)?.nome || "";
            const competicao =
              competicoes.find((c) => c.id === partida.competicaoId)?.nome || "";

            const getStatusBadge = () => {
              switch (partida.status) {
                case "OPERACAO_CONCLUIDA":
                  return (
                    <Badge
                      className="bg-green-600 dark:bg-green-700 text-white gap-1.5"
                      data-testid={`badge-status-${partida.id}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Operada
                    </Badge>
                  );
                case "NAO_OPERADA":
                  return (
                    <Badge
                      className="gap-1.5 text-white"
                      style={{ backgroundColor: "#5F2C82" }}
                      data-testid={`badge-status-${partida.id}`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Não Operada
                    </Badge>
                  );

                case "OPERACAO_PENDENTE":
                  return (
                    <Badge
                      className="bg-blue-600 dark:bg-blue-700 text-white gap-1.5"
                      data-testid={`badge-status-${partida.id}`}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Em Operação
                    </Badge>
                  );
                case "PRE_ANALISE":
                  return (
                    <Badge
                      variant="secondary"
                      className="gap-1.5"
                      data-testid={`badge-status-${partida.id}`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Aguardando Operação
                    </Badge>
                  );
                default:
                  return (
                    <Badge
                      variant="outline"
                      className="gap-1.5"
                      data-testid={`badge-status-${partida.id}`}
                    >
                      {partida.status}
                    </Badge>
                  );
              }
            };

            const isNaoOperada = partida.status === "NAO_OPERADA";

            return (
              <Card
                key={partida.id}
                data-testid={`card-partida-${partida.id}`}
                className={
                  isDarkMode
                    ? "bg-[#2a2b2e] border border-[#44494d] shadow-sm"
                    : "bg-white border border-gray-200 shadow-sm"
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {mandante} vs {visitante}
                        </CardTitle>
                        {getStatusBadge()}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{competicao}</div>
                        {partida.data && (
                          <div>
                            Partida:{" "}
                            {format(new Date(partida.data), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}{" "}
                            às {partida.hora}
                          </div>
                        )}
                        {partida.dataVerificacaoNaoOperada && isNaoOperada && (
                          <div>
                            Marcada em:{" "}
                            {format(
                              new Date(partida.dataVerificacaoNaoOperada),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isNaoOperada && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Justificativa
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                        {partida.justificativaNaoOperada || "Sem justificativa"}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Pré-Análise</h4>
                    <div className="bg-muted/30 p-3 rounded-md space-y-2 text-sm">
                      {preAnalise.tendenciaEsperada && (
                        <div>
                          <span className="font-medium">
                            Tendência Esperada:
                          </span>{" "}
                          {preAnalise.tendenciaEsperada}
                        </div>
                      )}
                      {preAnalise.classificacaoM &&
                        preAnalise.classificacaoV && (
                          <div>
                            <span className="font-medium">Classificação:</span>{" "}
                            {preAnalise.classificacaoM}º (M) x{" "}
                            {preAnalise.classificacaoV}º (V)
                          </div>
                        )}
                      {preAnalise.destaqueEssencial && (
                        <div>
                          <span className="font-medium">Destaque:</span>{" "}
                          {preAnalise.destaqueEssencial}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
