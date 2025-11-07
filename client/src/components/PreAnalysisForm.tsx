import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const momentoOptions = [
  "Boa Fase",
  "Má Fase",
  "Regular",
  "Equipe em Construção",
  "Técnico Interino",
  "Irregular",
  "Em Crise",
];

const mustWinOptions = [
  "Título",
  "Rebaixamento",
  "Classificação competições importantes",
  "Clássico",
  "Quebra de Tabus",
  "Classificação próxima fase",
  "Irrelevante",
];

const desempenhoOptions = ["Ótimo", "Bom", "Regular", "Ruim", "Péssimo"];

const tendenciaOptions = [
  "M Dominante",
  "V Dominante",
  "Trocação",
  "Jogo Truncado",
  "Jogo Complexo",
  "Jogo Morno",
];

const valorPotencialOptions = [
  "Odds Justas",
  "Odds Esmagadas",
  "Odds sem Valor",
  "Odds Boas",
];

export default function PreAnalysisForm() {
  return (
    <Card className="p-6" data-testid="form-pre-analysis">
      <h3 className="text-lg font-semibold mb-6">Pré-Análise da Partida</h3>

      <div className="space-y-6">
        {/* Mandante Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-primary">Mandante</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classificacao_m">Classificação</Label>
              <Input
                id="classificacao_m"
                maxLength={2}
                placeholder="Ex: 1º"
                className="w-32"
                data-testid="input-classificacao-mandante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="momento_m">Momento</Label>
              <Select>
                <SelectTrigger data-testid="select-momento-mandante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {momentoOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="must_win_m">Must Win</Label>
              <Select>
                <SelectTrigger data-testid="select-mustwin-mandante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {mustWinOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desempenho_casa_m">Desempenho em Casa</Label>
              <Select>
                <SelectTrigger data-testid="select-desempenho-mandante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {desempenhoOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Visitante Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-primary">Visitante</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classificacao_v">Classificação</Label>
              <Input
                id="classificacao_v"
                maxLength={2}
                placeholder="Ex: 3º"
                className="w-32"
                data-testid="input-classificacao-visitante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="momento_v">Momento</Label>
              <Select>
                <SelectTrigger data-testid="select-momento-visitante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {momentoOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="must_win_v">Must Win</Label>
              <Select>
                <SelectTrigger data-testid="select-mustwin-visitante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {mustWinOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desempenho_fora_v">Desempenho Fora</Label>
              <Select>
                <SelectTrigger data-testid="select-desempenho-visitante">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {desempenhoOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Análise Geral */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-primary">Análise Geral</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tendencia">Tendência Esperada</Label>
              <Select>
                <SelectTrigger data-testid="select-tendencia">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {tendenciaOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_potencial">Valor Potencial</Label>
              <Select>
                <SelectTrigger data-testid="select-valor-potencial">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {valorPotencialOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="destaque">Destaque Essencial</Label>
              <span className="text-xs text-muted-foreground">0/300</span>
            </div>
            <Textarea
              id="destaque"
              placeholder="Observações importantes sobre a partida..."
              maxLength={300}
              className="min-h-24"
              data-testid="textarea-destaque"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" data-testid="button-cancel">
            Cancelar
          </Button>
          <Button data-testid="button-save">
            Salvar Pré-Análise
          </Button>
        </div>
      </div>
    </Card>
  );
}
