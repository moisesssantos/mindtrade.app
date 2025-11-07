import { useState } from "react";
import MatchCard from "@/components/MatchCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Calendar } from "lucide-react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - todo: remove mock functionality
  const mockMatches = [
    {
      id: 1,
      mandante: "Botafogo",
      visitante: "Flamengo",
      competicao: "Brasileirão Série A",
      data: "28/10/2025",
      hora: "16:00",
      oddMandante: 2.50,
      oddVisitante: 2.80,
      oddEmpate: 3.20,
      status: "PRE_ANALISE" as const,
    },
    {
      id: 2,
      mandante: "Real Madrid",
      visitante: "Barcelona",
      competicao: "La Liga ESP",
      data: "28/10/2025",
      hora: "18:00",
      oddMandante: 2.10,
      oddVisitante: 3.40,
      oddEmpate: 3.10,
      status: "PRE_ANALISE" as const,
    },
    {
      id: 3,
      mandante: "Manchester City",
      visitante: "Liverpool",
      competicao: "Premier League",
      data: "29/10/2025",
      hora: "14:30",
      oddMandante: 1.95,
      oddVisitante: 3.80,
      oddEmpate: 3.50,
      status: "PRE_ANALISE" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pré-Análise</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie suas análises pré-jogo
            </p>
          </div>
          <Button data-testid="button-nova-pre-analise">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pré-Análise
          </Button>
        </div>

        <div className="bg-card/50 backdrop-blur border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipe ou competição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-matches"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                className="pl-10"
                data-testid="input-filter-date"
              />
            </div>
            <Select>
              <SelectTrigger data-testid="select-filter-competicao">
                <SelectValue placeholder="Todas competições" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="brasileirao">Brasileirão Série A</SelectItem>
                <SelectItem value="laliga">La Liga ESP</SelectItem>
                <SelectItem value="premier">Premier League</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMatches.map((match) => (
            <MatchCard
              key={match.id}
              {...match}
              onConvert={() => console.log('Converter partida', match.id)}
              onClick={() => console.log('Ver detalhes', match.id)}
            />
          ))}
        </div>

        {mockMatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma pré-análise encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
