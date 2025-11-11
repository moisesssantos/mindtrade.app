import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEquipeSchema, 
  insertCompeticaoSchema, 
  insertMercadoSchema,
  insertEstrategiaSchema,
  insertPartidaSchema,
  insertPreAnaliseSchema,
  insertOperacaoSchema,
  insertOperacaoItemSchema,
  insertTransacaoFinanceiraSchema,
  insertOpcaoCustomizadaSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ===== EQUIPES =====
  app.get("/api/equipes", async (req, res) => {
    try {
      const { search } = req.query;
      const equipes = search 
        ? await storage.searchEquipes(search as string)
        : await storage.getEquipes();
      res.json(equipes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/equipes/:id", async (req, res) => {
    try {
      const equipe = await storage.getEquipeById(parseInt(req.params.id));
      if (!equipe) {
        return res.status(404).json({ error: "Equipe não encontrada" });
      }
      res.json(equipe);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/equipes", async (req, res) => {
    try {
      const data = insertEquipeSchema.parse(req.body);
      const equipe = await storage.createEquipe(data);
      res.status(201).json(equipe);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe uma equipe com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/equipes/:id", async (req, res) => {
    try {
      const data = insertEquipeSchema.partial().parse(req.body);
      const equipe = await storage.updateEquipe(parseInt(req.params.id), data);
      if (!equipe) {
        return res.status(404).json({ error: "Equipe não encontrada" });
      }
      res.json(equipe);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe uma equipe com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/equipes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEquipe(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Equipe não encontrada" });
      }
      res.status(204).send();
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir esta equipe pois está vinculada a partidas" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ===== COMPETIÇÕES =====
  app.get("/api/competicoes", async (req, res) => {
    try {
      const { search } = req.query;
      const competicoes = search 
        ? await storage.searchCompeticoes(search as string)
        : await storage.getCompeticoes();
      res.json(competicoes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/competicoes/:id", async (req, res) => {
    try {
      const competicao = await storage.getCompeticaoById(parseInt(req.params.id));
      if (!competicao) {
        return res.status(404).json({ error: "Competição não encontrada" });
      }
      res.json(competicao);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/competicoes", async (req, res) => {
    try {
      const data = insertCompeticaoSchema.parse(req.body);
      const competicao = await storage.createCompeticao(data);
      res.status(201).json(competicao);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe uma competição com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/competicoes/:id", async (req, res) => {
    try {
      const data = insertCompeticaoSchema.partial().parse(req.body);
      const competicao = await storage.updateCompeticao(parseInt(req.params.id), data);
      if (!competicao) {
        return res.status(404).json({ error: "Competição não encontrada" });
      }
      res.json(competicao);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe uma competição com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/competicoes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCompeticao(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Competição não encontrada" });
      }
      res.status(204).send();
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir esta competição pois está vinculada a partidas" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ===== MERCADOS =====
  app.get("/api/mercados", async (req, res) => {
    try {
      const { search } = req.query;
      const mercados = search 
        ? await storage.searchMercados(search as string)
        : await storage.getMercados();
      res.json(mercados);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mercados/:id", async (req, res) => {
    try {
      const mercado = await storage.getMercadoById(parseInt(req.params.id));
      if (!mercado) {
        return res.status(404).json({ error: "Mercado não encontrado" });
      }
      res.json(mercado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mercados", async (req, res) => {
    try {
      const data = insertMercadoSchema.parse(req.body);
      const mercado = await storage.createMercado(data);
      res.status(201).json(mercado);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe um mercado com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/mercados/:id", async (req, res) => {
    try {
      const data = insertMercadoSchema.partial().parse(req.body);
      const mercado = await storage.updateMercado(parseInt(req.params.id), data);
      if (!mercado) {
        return res.status(404).json({ error: "Mercado não encontrado" });
      }
      res.json(mercado);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe um mercado com este nome" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/mercados/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMercado(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Mercado não encontrado" });
      }
      res.status(204).send();
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir este mercado pois está vinculado a estratégias ou operações" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ESTRATÉGIAS =====
  app.get("/api/estrategias", async (req, res) => {
    try {
      const { search } = req.query;
      const estrategias = search 
        ? await storage.searchEstrategias(search as string)
        : await storage.getEstrategias();
      res.json(estrategias);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/estrategias/:id", async (req, res) => {
    try {
      const estrategia = await storage.getEstrategiaById(parseInt(req.params.id));
      if (!estrategia) {
        return res.status(404).json({ error: "Estratégia não encontrada" });
      }
      res.json(estrategia);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/estrategias", async (req, res) => {
    try {
      const data = insertEstrategiaSchema.parse(req.body);
      const estrategia = await storage.createEstrategia(data);
      res.status(201).json(estrategia);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Mercado não encontrado" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/estrategias/:id", async (req, res) => {
    try {
      const data = insertEstrategiaSchema.partial().parse(req.body);
      const estrategia = await storage.updateEstrategia(parseInt(req.params.id), data);
      if (!estrategia) {
        return res.status(404).json({ error: "Estratégia não encontrada" });
      }
      res.json(estrategia);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Mercado não encontrado" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/estrategias/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEstrategia(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Estratégia não encontrada" });
      }
      res.status(204).send();
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir esta estratégia pois está vinculada a operações" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PARTIDAS =====
  app.get("/api/partidas/pendentes-verificacao", async (req, res) => {
    try {
      const partidas = await storage.getPartidasPendentesVerificacao();
      res.json(partidas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partidas", async (req, res) => {
    try {
      const { dataInicio, dataFim, competicaoId } = req.query;
      const partidas = await storage.getPartidas({
        dataInicio: dataInicio as string,
        dataFim: dataFim as string,
        competicaoId: competicaoId ? parseInt(competicaoId as string) : undefined,
      });
      res.json(partidas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partidas/:id", async (req, res) => {
    try {
      const partida = await storage.getPartidaById(parseInt(req.params.id));
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }
      res.json(partida);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/partidas", async (req, res) => {
    try {
      const data = insertPartidaSchema.parse(req.body);
      const partida = await storage.createPartida(data);
      res.status(201).json(partida);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Competição ou equipe não encontrada" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/partidas/:id", async (req, res) => {
    try {
      const data = insertPartidaSchema.partial().parse(req.body);
      const partida = await storage.updatePartida(parseInt(req.params.id), data);
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }
      res.json(partida);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/partidas/:id", async (req, res) => {
    try {
      const partidaId = parseInt(req.params.id);
      
      // Verificar se existem operações para essa partida
      const operacoes = await storage.getOperacoesByPartidaId(partidaId);
      
      // Excluir operações vazias (sem itens)
      for (const operacao of operacoes) {
        const itens = await storage.getOperacaoItens(operacao.id);
        if (itens.length === 0) {
          // Operação vazia - pode excluir
          await storage.deleteOperacao(operacao.id);
        }
      }
      
      // Tentar excluir a partida
      const deleted = await storage.deletePartida(partidaId);
      if (!deleted) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }
      res.status(204).send();
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Não é possível excluir esta partida pois possui pré-análise ou operações vinculadas" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/partidas/:id/marcar-nao-operada", async (req, res) => {
    try {
      const { justificativa } = req.body;
      if (!justificativa || justificativa.trim() === '') {
        return res.status(400).json({ error: "Justificativa é obrigatória" });
      }
      
      const partida = await storage.marcarPartidaNaoOperada(parseInt(req.params.id), justificativa);
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }
      res.json(partida);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/partidas/:id/marcar-verificada", async (req, res) => {
    try {
      const partida = await storage.marcarPartidaVerificada(parseInt(req.params.id));
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }
      res.json(partida);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PRÉ-ANÁLISES =====
  app.get("/api/pre-analises/com-partidas", async (req, res) => {
    try {
      const preAnalises = await storage.getPreAnalisesComPartidas();
      res.json(preAnalises);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pre-analises", async (req, res) => {
    try {
      const preAnalises = await storage.getAllPreAnalises();
      res.json(preAnalises);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pre-analises/:partidaId", async (req, res) => {
    try {
      const preAnalise = await storage.getPreAnaliseByPartidaId(parseInt(req.params.partidaId));
      if (!preAnalise) {
        return res.status(404).json({ error: "Pré-análise não encontrada" });
      }
      res.json(preAnalise);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pre-analises", async (req, res) => {
    try {
      const data = insertPreAnaliseSchema.parse(req.body);
      
      // Verificar se partida existe e está em PRE_ANALISE
      const partida = await storage.getPartidaById(data.partidaId);
      if (!partida) {
        return res.status(400).json({ error: "Partida não encontrada" });
      }
      
      const preAnalise = await storage.createPreAnalise(data);
      
      // Atualizar status da partida para OPERACAO_PENDENTE se ainda estiver em PRE_ANALISE
      if (partida.status === 'PRE_ANALISE') {
        await storage.updatePartidaStatus(data.partidaId, 'OPERACAO_PENDENTE');
      }
      
      res.status(201).json(preAnalise);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Partida não encontrada" });
      }
      if (error.code === '23505') {
        return res.status(400).json({ error: "Já existe uma pré-análise para esta partida" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/pre-analises/:partidaId", async (req, res) => {
    try {
      const data = insertPreAnaliseSchema.partial().parse(req.body);
      const preAnalise = await storage.updatePreAnalise(parseInt(req.params.partidaId), data);
      if (!preAnalise) {
        return res.status(404).json({ error: "Pré-análise não encontrada" });
      }
      res.json(preAnalise);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== OPERAÇÕES =====
  app.get("/api/operacoes", async (req, res) => {
    try {
      const operacoes = await storage.getOperacoes();
      res.json(operacoes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/operacoes/:id", async (req, res) => {
    try {
      const operacao = await storage.getOperacaoById(parseInt(req.params.id));
      if (!operacao) {
        return res.status(404).json({ error: "Operação não encontrada" });
      }
      res.json(operacao);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/operacoes", async (req, res) => {
    try {
      const data = insertOperacaoSchema.parse(req.body);
      
      // Verificar se partida existe
      const partida = await storage.getPartidaById(data.partidaId);
      if (!partida) {
        return res.status(400).json({ error: "Partida não encontrada" });
      }
      
      const operacao = await storage.createOperacao(data);
      
      // Atualizar status da partida para OPERACAO_PENDENTE se ainda não estiver
      if (partida.status === 'PRE_ANALISE') {
        await storage.updatePartidaStatus(data.partidaId, 'OPERACAO_PENDENTE');
      }
      
      res.status(201).json(operacao);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Partida não encontrada" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/operacoes/:id/concluir", async (req, res) => {
    try {
      // Buscar operação para pegar partidaId
      const operacao = await storage.getOperacaoById(parseInt(req.params.id));
      if (!operacao) {
        return res.status(404).json({ error: "Operação não encontrada" });
      }

      // Verificar se todos os itens têm resultado financeiro
      const itens = await storage.getOperacaoItens(parseInt(req.params.id));
      const todosComResultado = itens.every(item => item.resultadoFinanceiro !== null);
      
      if (!todosComResultado) {
        return res.status(400).json({ 
          error: "Não é possível concluir a operação. Todos os itens devem ter resultado financeiro preenchido." 
        });
      }

      const operacaoAtualizada = await storage.concluirOperacao(parseInt(req.params.id));
      
      // Atualizar status da partida para OPERACAO_CONCLUIDA
      await storage.updatePartidaStatus(operacao.partidaId, 'OPERACAO_CONCLUIDA');
      
      res.json(operacaoAtualizada);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ITENS DE OPERAÇÃO =====
  app.get("/api/operacoes/:operacaoId/itens", async (req, res) => {
    try {
      const itens = await storage.getOperacaoItens(parseInt(req.params.operacaoId));
      res.json(itens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/operacoes/:operacaoId/itens", async (req, res) => {
    try {
      const data = insertOperacaoItemSchema.parse({
        ...req.body,
        operacaoId: parseInt(req.params.operacaoId)
      });
      const item = await storage.createOperacaoItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      if (error.code === '23503') {
        return res.status(400).json({ error: "Operação, mercado ou estratégia não encontrada" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/operacoes/itens/:id", async (req, res) => {
    try {
      const data = insertOperacaoItemSchema.partial().parse(req.body);
      const item = await storage.updateOperacaoItem(parseInt(req.params.id), data);
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/operacoes/itens/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      
      // Primeiro, buscar o item para saber qual operação ele pertence
      const itemAExcluir = await storage.getOperacaoItemById(itemId);
      
      if (!itemAExcluir) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      
      const operacaoId = itemAExcluir.operacaoId;
      
      // Excluir o item
      const deleted = await storage.deleteOperacaoItem(itemId);
      if (!deleted) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      
      // Verificar quantos itens restam na operação
      const itensRestantes = await storage.getOperacaoItens(operacaoId);
      
      // Se não houver mais itens, excluir a operação e reverter status da partida
      if (itensRestantes.length === 0) {
        const operacao = await storage.getOperacaoById(operacaoId);
        
        if (operacao) {
          // Excluir a operação
          const operacaoExcluida = await storage.deleteOperacao(operacaoId);
          
          // Reverter status da partida para PRE_ANALISE apenas se a operação foi excluída com sucesso
          if (operacaoExcluida) {
            await storage.updatePartidaStatus(operacao.partidaId, 'PRE_ANALISE');
          }
        }
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== RELATÓRIOS =====
  app.get("/api/relatorios", async (req, res) => {
    try {
      // Obter todas as operações concluídas
      const operacoes = await storage.getOperacoes();
      const operacoesConcluidas = operacoes.filter(op => op.status === 'CONCLUIDA');
      
      // Obter todos os itens de operações concluídas
      const todosItens = [];
      for (const op of operacoesConcluidas) {
        const itens = await storage.getOperacaoItens(op.id);
        todosItens.push(...itens.map(item => ({ ...item, operacaoId: op.id })));
      }

      res.json({
        operacoes: operacoesConcluidas,
        itens: todosItens,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== RESUMO ANUAL =====
  app.get("/api/resumo-anual/:ano", async (req, res) => {
    try {
      const ano = parseInt(req.params.ano);
      
      // Buscar todas as operações concluídas
      const operacoes = await storage.getOperacoes();
      const operacoesConcluidas = operacoes.filter(op => op.status === 'CONCLUIDA');
      
      // Buscar todos os itens de operações concluídas com suas partidas
      const operacoesComItens = [];
      for (const op of operacoesConcluidas) {
        const itens = await storage.getOperacaoItens(op.id);
        const partida = await storage.getPartidaById(op.partidaId);
        if (partida) {
          operacoesComItens.push({ ...op, itens, partida });
        }
      }
      
      // Buscar todas as transações
      const transacoes = await storage.getTransacoesFinanceiras();
      
      // Agregar dados por mês
      const mesesData = [];
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      let valorAcumulado = 0;
      
      for (let mesIndex = 0; mesIndex < 12; mesIndex++) {
        const mesNumero = mesIndex + 1;
        
        // Filtrar transações do mês/ano
        const transacoesMes = transacoes.filter(t => {
          const dataTransacao = new Date(t.data);
          return dataTransacao.getFullYear() === ano && dataTransacao.getMonth() === mesIndex;
        });
        
        // Calcular depósitos e saques do mês
        const depositos = transacoesMes
          .filter(t => t.tipo === 'DEPOSITO')
          .reduce((sum, t) => sum + parseFloat(t.valor), 0);
        
        const saques = transacoesMes
          .filter(t => t.tipo === 'SAQUE')
          .reduce((sum, t) => sum + parseFloat(t.valor), 0);
        
        // Filtrar operações do mês/ano
        const operacoesMes = operacoesComItens.filter(op => {
          const dataPartida = new Date(op.partida.data);
          return dataPartida.getFullYear() === ano && dataPartida.getMonth() === mesIndex;
        });
        
        // Calcular lucro/prejuízo do mês (soma dos resultados dos itens)
        const lucroMes = operacoesMes.reduce((sum, op) => {
          const resultadoOperacao = op.itens.reduce((s, item) => {
            return s + (parseFloat(item.resultadoFinanceiro || '0'));
          }, 0);
          return sum + resultadoOperacao;
        }, 0);
        
        // Valor inicial do mês é o acumulado anterior + depósitos - saques
        const valorInicial = valorAcumulado + depositos - saques;
        
        // Valor final é o inicial + lucro/prejuízo
        const valorFinal = valorInicial + lucroMes;
        
        // ROI = (lucro/prejuízo / valor inicial) * 100
        const roi = valorInicial > 0 ? (lucroMes / valorInicial) * 100 : 0;
        
        // Atualizar valor acumulado para o próximo mês
        valorAcumulado = valorFinal;
        
        mesesData.push({
          mes: meses[mesIndex],
          mesNumero,
          valorInicial,
          lucro: lucroMes,
          valorFinal,
          roi,
          depositos,
          saques,
        });
      }
      
      res.json(mesesData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TRANSAÇÕES FINANCEIRAS =====
  app.get("/api/transacoes", async (req, res) => {
    try {
      const transacoes = await storage.getTransacoesFinanceiras();
      res.json(transacoes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transacoes/:id", async (req, res) => {
    try {
      const transacao = await storage.getTransacaoFinanceiraById(parseInt(req.params.id));
      if (!transacao) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.json(transacao);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transacoes", async (req, res) => {
    try {
      const data = insertTransacaoFinanceiraSchema.parse(req.body);
      const transacao = await storage.createTransacaoFinanceira(data);
      res.status(201).json(transacao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/transacoes/:id", async (req, res) => {
    try {
      const data = insertTransacaoFinanceiraSchema.parse(req.body);
      const transacao = await storage.updateTransacaoFinanceira(parseInt(req.params.id), data);
      if (!transacao) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.json(transacao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/transacoes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransacaoFinanceira(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== OPÇÕES CUSTOMIZADAS =====
app.get("/api/opcoes/:campo", async (req, res) => {
  try {
    const opcoes = await storage.getOpcoesPorCampo(req.params.campo);
    res.json(opcoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/opcoes", async (req, res) => {
  try {
    const data = insertOpcaoCustomizadaSchema.parse(req.body);

    // ✅ Verifica se já existe opção igual para o mesmo campo
    const existentes = await storage.getOpcoesPorCampo(data.campo);
    const jaExiste = existentes.some(
      (op) => op.opcao.trim().toLowerCase() === data.opcao.trim().toLowerCase()
    );

    if (jaExiste) {
      return res
        .status(400)
        .json({ error: "Essa opção já existe para este campo" });
    }

    const opcao = await storage.createOpcaoCustomizada(data);
    res.status(201).json(opcao);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/opcoes/:id", async (req, res) => {
  try {
    const data = insertOpcaoCustomizadaSchema.partial().parse(req.body);
    const opcao = await storage.updateOpcaoCustomizada(
      parseInt(req.params.id),
      data
    );
    if (!opcao) {
      return res.status(404).json({ error: "Opção não encontrada" });
    }
    res.json(opcao);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/opcoes/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteOpcaoCustomizada(
      parseInt(req.params.id)
    );
    if (!deleted) {
      return res.status(404).json({ error: "Opção não encontrada" });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const httpServer = createServer(app);
return httpServer;
}
