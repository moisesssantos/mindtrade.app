import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import VerificarPartidasDialog from "@/components/VerificarPartidasDialog";
import Dashboard from "@/pages/Dashboard";
import Partidas from "@/pages/Partidas";
import PreAnalises from "@/pages/PreAnalises";
import Operacoes from "@/pages/Operacoes";
import OperacaoDetalhes from "@/pages/OperacaoDetalhes";
import Relatorios from "@/pages/Relatorios";
import ResumoAnual from "@/pages/ResumoAnual";
import Cadastros from "@/pages/Cadastros";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/partidas" component={Partidas} />
      <Route path="/pre-analises" component={PreAnalises} />
      <Route path="/operacoes/:partidaId" component={OperacaoDetalhes} />
      <Route path="/operacoes" component={Operacoes} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/resumo-anual" component={ResumoAnual} />
      <Route path="/cadastros" component={Cadastros} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Router />
        </div>
        <VerificarPartidasDialog />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
