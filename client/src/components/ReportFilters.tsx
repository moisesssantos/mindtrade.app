import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export default function ReportFilters() {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4" data-testid="filters-report">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data-inicio">Data Início</Label>
          <div className="relative">
            <Input
              id="data-inicio"
              type="date"
              data-testid="input-data-inicio"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data-fim">Data Fim</Label>
          <div className="relative">
            <Input
              id="data-fim"
              type="date"
              data-testid="input-data-fim"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="competicao">Competição</Label>
          <Select>
            <SelectTrigger data-testid="select-competicao">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="brasileirao">Brasileirão Série A</SelectItem>
              <SelectItem value="laliga">La Liga ESP</SelectItem>
              <SelectItem value="premier">Premier League</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mercado">Mercado</Label>
          <Select>
            <SelectTrigger data-testid="select-mercado">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="match-odds">Match Odds</SelectItem>
              <SelectItem value="ambas-marcam">Ambas Marcam</SelectItem>
              <SelectItem value="correct-score">Correct Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" data-testid="button-clear-filters">
          Limpar Filtros
        </Button>
        <Button data-testid="button-apply-filters">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
