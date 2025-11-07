import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const estadoEmocionalOptions = [
  "Ansioso",
  "Calmo",
  "Eufórico",
  "Foda-se",
  "Frustrado",
  "Irritado",
  "Neutro",
  "Preocupado com o red",
];

const motivacaoEntradaOptions = [
  "Aleatória",
  "Análise/Método Pré-Jogo",
  "Intuição/Feeling",
  "Medo de perder oportunidade",
  "Recuperar prejuízo",
  "Sinal técnico",
];

const autoavaliacaoOptions = ["Excelente", "Boa", "Regular", "Ruim", "Péssima"];

interface OperationItemCardProps {
  index: number;
  mercado: string;
  estrategia: string;
  onDelete: () => void;
}

export default function OperationItemCard({
  index,
  mercado,
  estrategia,
  onDelete,
}: OperationItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4" data-testid={`card-operation-item-${index}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover-elevate rounded"
            data-testid={`button-toggle-${index}`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <div>
            <div className="font-medium text-sm">{mercado}</div>
            <div className="text-xs text-muted-foreground">{estrategia}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          data-testid={`button-delete-item-${index}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-3 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stake</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="font-mono"
                data-testid={`input-stake-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado Financeiro</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="font-mono"
                data-testid={`input-resultado-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Odd Entrada</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1.01"
                className="font-mono"
                data-testid={`input-odd-entrada-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Odd Saída (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="1.01"
                className="font-mono"
                data-testid={`input-odd-saida-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Tempo Exposição (min)</Label>
              <Input
                type="number"
                placeholder="0"
                data-testid={`input-tempo-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado Emocional</Label>
              <Select>
                <SelectTrigger data-testid={`select-emocional-${index}`}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {estadoEmocionalOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivação Entrada</Label>
              <Select>
                <SelectTrigger data-testid={`select-motivacao-${index}`}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {motivacaoEntradaOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Autoavaliação</Label>
              <Select>
                <SelectTrigger data-testid={`select-autoavaliacao-${index}`}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {autoavaliacaoOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id={`seguiu-plano-${index}`} data-testid={`checkbox-seguiu-plano-${index}`} />
            <Label htmlFor={`seguiu-plano-${index}`} className="cursor-pointer">
              Seguiu o plano?
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Motivação Saída / Observação</Label>
              <span className="text-xs text-muted-foreground">0/400</span>
            </div>
            <Textarea
              placeholder="Observações sobre a saída da operação..."
              maxLength={400}
              className="min-h-20"
              data-testid={`textarea-observacao-${index}`}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
