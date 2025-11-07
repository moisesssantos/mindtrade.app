import { db } from "./db";
import { 
  equipes, competicoes, mercados, estrategias, partidas, preAnalises, operacoes, operacaoItens, transacoesFinanceiras, opcoesCustomizadas,
  type Equipe, type InsertEquipe,
  type Competicao, type InsertCompeticao,
  type Mercado, type InsertMercado,
  type Estrategia, type InsertEstrategia,
  type Partida, type InsertPartida,
  type PreAnalise, type InsertPreAnalise,
  type Operacao, type InsertOperacao,
  type OperacaoItem, type InsertOperacaoItem,
  type TransacaoFinanceira, type InsertTransacaoFinanceira,
  type OpcaoCustomizada, type InsertOpcaoCustomizada,
} from "@shared/schema";
import { eq, sql, ilike, and, desc, SQL } from "drizzle-orm";

// Função auxiliar para normalizar strings (remover acentos e converter para lowercase)
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Função auxiliar para converter número para string (para campos numeric do PostgreSQL)
function numberToString(value: number | undefined): string | undefined {
  return value !== undefined ? value.toString() : undefined;
}

export interface IStorage {
  // Equipes
  getEquipes(): Promise<Equipe[]>;
  getEquipeById(id: number): Promise<Equipe | undefined>;
  createEquipe(data: InsertEquipe): Promise<Equipe>;
  updateEquipe(id: number, data: Partial<InsertEquipe>): Promise<Equipe | undefined>;
  deleteEquipe(id: number): Promise<boolean>;
  searchEquipes(term: string): Promise<Equipe[]>;

  // Competições
  getCompeticoes(): Promise<Competicao[]>;
  getCompeticaoById(id: number): Promise<Competicao | undefined>;
  createCompeticao(data: InsertCompeticao): Promise<Competicao>;
  updateCompeticao(id: number, data: Partial<InsertCompeticao>): Promise<Competicao | undefined>;
  deleteCompeticao(id: number): Promise<boolean>;
  searchCompeticoes(term: string): Promise<Competicao[]>;

  // Mercados
  getMercados(): Promise<Mercado[]>;
  getMercadoById(id: number): Promise<Mercado | undefined>;
  createMercado(data: InsertMercado): Promise<Mercado>;
  updateMercado(id: number, data: Partial<InsertMercado>): Promise<Mercado | undefined>;
  deleteMercado(id: number): Promise<boolean>;
  searchMercados(term: string): Promise<Mercado[]>;

  // Estratégias
  getEstrategias(): Promise<Estrategia[]>;
  getEstrategiaById(id: number): Promise<Estrategia | undefined>;
  createEstrategia(data: InsertEstrategia): Promise<Estrategia>;
  updateEstrategia(id: number, data: Partial<InsertEstrategia>): Promise<Estrategia | undefined>;
  deleteEstrategia(id: number): Promise<boolean>;
  searchEstrategias(term: string): Promise<Estrategia[]>;

  // Partidas
  getPartidas(filters?: { dataInicio?: string; dataFim?: string; competicaoId?: number }): Promise<Partida[]>;
  getPartidaById(id: number): Promise<Partida | undefined>;
  createPartida(data: InsertPartida): Promise<Partida>;
  updatePartida(id: number, data: Partial<InsertPartida>): Promise<Partida | undefined>;
  updatePartidaStatus(id: number, status: 'PRE_ANALISE' | 'OPERACAO_PENDENTE' | 'OPERACAO_CONCLUIDA' | 'NAO_OPERADA'): Promise<Partida | undefined>;
  deletePartida(id: number): Promise<boolean>;
  getPartidasPendentesVerificacao(): Promise<Partida[]>;
  marcarPartidaNaoOperada(id: number, justificativa: string): Promise<Partida | undefined>;
  marcarPartidaVerificada(id: number): Promise<Partida | undefined>;

  // Pré-Análises
  getPreAnaliseByPartidaId(partidaId: number): Promise<PreAnalise | undefined>;
  getPreAnalisesComPartidas(): Promise<any[]>;
  createPreAnalise(data: InsertPreAnalise): Promise<PreAnalise>;
  updatePreAnalise(partidaId: number, data: Partial<InsertPreAnalise>): Promise<PreAnalise | undefined>;

  // Operações
  getOperacoes(): Promise<Operacao[]>;
  getOperacaoById(id: number): Promise<Operacao | undefined>;
  getOperacoesByPartidaId(partidaId: number): Promise<Operacao[]>;
  createOperacao(data: InsertOperacao): Promise<Operacao>;
  updateOperacao(id: number, data: Partial<Operacao>): Promise<Operacao | undefined>;
  concluirOperacao(id: number): Promise<Operacao | undefined>;
  deleteOperacao(id: number): Promise<boolean>;

  // Itens de Operação
  getOperacaoItens(operacaoId: number): Promise<OperacaoItem[]>;
  getOperacaoItemById(id: number): Promise<OperacaoItem | undefined>;
  createOperacaoItem(data: InsertOperacaoItem): Promise<OperacaoItem>;
  updateOperacaoItem(id: number, data: Partial<InsertOperacaoItem>): Promise<OperacaoItem | undefined>;
  deleteOperacaoItem(id: number): Promise<boolean>;

  // Transações Financeiras
  getTransacoesFinanceiras(): Promise<TransacaoFinanceira[]>;
  getTransacaoFinanceiraById(id: number): Promise<TransacaoFinanceira | undefined>;
  createTransacaoFinanceira(data: InsertTransacaoFinanceira): Promise<TransacaoFinanceira>;
  updateTransacaoFinanceira(id: number, data: InsertTransacaoFinanceira): Promise<TransacaoFinanceira | undefined>;
  deleteTransacaoFinanceira(id: number): Promise<boolean>;

  // Opções Customizadas
  getOpcoesPorCampo(campo: string): Promise<OpcaoCustomizada[]>;
  createOpcaoCustomizada(data: InsertOpcaoCustomizada): Promise<OpcaoCustomizada>;
  updateOpcaoCustomizada(id: number, data: Partial<InsertOpcaoCustomizada>): Promise<OpcaoCustomizada | undefined>;
  deleteOpcaoCustomizada(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Equipes
  async getEquipes(): Promise<Equipe[]> {
    return await db.select().from(equipes).orderBy(equipes.nome);
  }

  async getEquipeById(id: number): Promise<Equipe | undefined> {
    const result = await db.select().from(equipes).where(eq(equipes.id, id));
    return result[0];
  }

  async createEquipe(data: InsertEquipe): Promise<Equipe> {
    const nomeNormalizado = normalizeString(data.nome);
    const result = await db.insert(equipes).values({
      nome: data.nome,
      nomeNormalizado,
    }).returning();
    return result[0];
  }

  async updateEquipe(id: number, data: Partial<InsertEquipe>): Promise<Equipe | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.nome) {
      updateData.nomeNormalizado = normalizeString(data.nome);
    }
    const result = await db.update(equipes).set(updateData).where(eq(equipes.id, id)).returning();
    return result[0];
  }

  async deleteEquipe(id: number): Promise<boolean> {
    const result = await db.delete(equipes).where(eq(equipes.id, id)).returning();
    return result.length > 0;
  }

  async searchEquipes(term: string): Promise<Equipe[]> {
    const normalized = normalizeString(term);
    return await db.select().from(equipes).where(ilike(equipes.nomeNormalizado, `%${normalized}%`)).orderBy(equipes.nome);
  }

  // Competições
  async getCompeticoes(): Promise<Competicao[]> {
    return await db.select().from(competicoes).orderBy(competicoes.nome);
  }

  async getCompeticaoById(id: number): Promise<Competicao | undefined> {
    const result = await db.select().from(competicoes).where(eq(competicoes.id, id));
    return result[0];
  }

  async createCompeticao(data: InsertCompeticao): Promise<Competicao> {
    const nomeNormalizado = normalizeString(data.nome);
    const result = await db.insert(competicoes).values({
      nome: data.nome,
      nomeNormalizado,
    }).returning();
    return result[0];
  }

  async updateCompeticao(id: number, data: Partial<InsertCompeticao>): Promise<Competicao | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.nome) {
      updateData.nomeNormalizado = normalizeString(data.nome);
    }
    const result = await db.update(competicoes).set(updateData).where(eq(competicoes.id, id)).returning();
    return result[0];
  }

  async deleteCompeticao(id: number): Promise<boolean> {
    const result = await db.delete(competicoes).where(eq(competicoes.id, id)).returning();
    return result.length > 0;
  }

  async searchCompeticoes(term: string): Promise<Competicao[]> {
    const normalized = normalizeString(term);
    return await db.select().from(competicoes).where(ilike(competicoes.nomeNormalizado, `%${normalized}%`)).orderBy(competicoes.nome);
  }

  // Mercados
  async getMercados(): Promise<Mercado[]> {
    return await db.select().from(mercados).orderBy(mercados.nome);
  }

  async getMercadoById(id: number): Promise<Mercado | undefined> {
    const result = await db.select().from(mercados).where(eq(mercados.id, id));
    return result[0];
  }

  async createMercado(data: InsertMercado): Promise<Mercado> {
    const nomeNormalizado = normalizeString(data.nome);
    const result = await db.insert(mercados).values({
      nome: data.nome,
      nomeNormalizado,
    }).returning();
    return result[0];
  }

  async updateMercado(id: number, data: Partial<InsertMercado>): Promise<Mercado | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.nome) {
      updateData.nomeNormalizado = normalizeString(data.nome);
    }
    const result = await db.update(mercados).set(updateData).where(eq(mercados.id, id)).returning();
    return result[0];
  }

  async deleteMercado(id: number): Promise<boolean> {
    const result = await db.delete(mercados).where(eq(mercados.id, id)).returning();
    return result.length > 0;
  }

  async searchMercados(term: string): Promise<Mercado[]> {
    const normalized = normalizeString(term);
    return await db.select().from(mercados).where(ilike(mercados.nomeNormalizado, `%${normalized}%`)).orderBy(mercados.nome);
  }

  // Estratégias
  async getEstrategias(): Promise<Estrategia[]> {
    return await db.select().from(estrategias).orderBy(estrategias.nome);
  }

  async getEstrategiaById(id: number): Promise<Estrategia | undefined> {
    const result = await db.select().from(estrategias).where(eq(estrategias.id, id));
    return result[0];
  }

  async createEstrategia(data: InsertEstrategia): Promise<Estrategia> {
    const nomeNormalizado = normalizeString(data.nome);
    const result = await db.insert(estrategias).values({
      ...data,
      nomeNormalizado,
    }).returning();
    return result[0];
  }

  async updateEstrategia(id: number, data: Partial<InsertEstrategia>): Promise<Estrategia | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.nome) {
      updateData.nomeNormalizado = normalizeString(data.nome);
    }
    const result = await db.update(estrategias).set(updateData).where(eq(estrategias.id, id)).returning();
    return result[0];
  }

  async deleteEstrategia(id: number): Promise<boolean> {
    const result = await db.delete(estrategias).where(eq(estrategias.id, id)).returning();
    return result.length > 0;
  }

  async searchEstrategias(term: string): Promise<Estrategia[]> {
    const normalized = normalizeString(term);
    return await db.select().from(estrategias).where(ilike(estrategias.nomeNormalizado, `%${normalized}%`)).orderBy(estrategias.nome);
  }

  // Partidas
  async getPartidas(filters?: { dataInicio?: string; dataFim?: string; competicaoId?: number }): Promise<Partida[]> {
    const conditions: SQL[] = [];
    
    if (filters?.dataInicio) {
      conditions.push(sql`${partidas.data} >= ${filters.dataInicio}`);
    }
    if (filters?.dataFim) {
      conditions.push(sql`${partidas.data} <= ${filters.dataFim}`);
    }
    if (filters?.competicaoId) {
      conditions.push(eq(partidas.competicaoId, filters.competicaoId));
    }

    if (conditions.length > 0) {
      return await db.select().from(partidas).where(and(...conditions)).orderBy(desc(partidas.data));
    }
    
    return await db.select().from(partidas).orderBy(desc(partidas.data));
  }

  async getPartidaById(id: number): Promise<Partida | undefined> {
    const result = await db.select().from(partidas).where(eq(partidas.id, id));
    return result[0];
  }

  async createPartida(data: InsertPartida): Promise<Partida> {
    const result = await db.insert(partidas).values({
      ...data,
      oddMandante: numberToString(data.oddMandante),
      oddVisitante: numberToString(data.oddVisitante),
      oddEmpate: numberToString(data.oddEmpate),
    }).returning();
    return result[0];
  }

  async updatePartida(id: number, data: Partial<InsertPartida>): Promise<Partida | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.oddMandante !== undefined) updateData.oddMandante = numberToString(data.oddMandante);
    if (data.oddVisitante !== undefined) updateData.oddVisitante = numberToString(data.oddVisitante);
    if (data.oddEmpate !== undefined) updateData.oddEmpate = numberToString(data.oddEmpate);
    const result = await db.update(partidas).set(updateData).where(eq(partidas.id, id)).returning();
    return result[0];
  }

  async updatePartidaStatus(id: number, status: 'PRE_ANALISE' | 'OPERACAO_PENDENTE' | 'OPERACAO_CONCLUIDA' | 'NAO_OPERADA'): Promise<Partida | undefined> {
    const result = await db.update(partidas).set({ status, updatedAt: new Date() }).where(eq(partidas.id, id)).returning();
    return result[0];
  }

  async deletePartida(id: number): Promise<boolean> {
    const result = await db.delete(partidas).where(eq(partidas.id, id)).returning();
    return result.length > 0;
  }

  async getPartidasPendentesVerificacao(): Promise<Partida[]> {
    // Buscar partidas que:
    // 1. Têm pré-análise criada (status PRE_ANALISE)
    // 2. Data da partida + 24h já passou
    // 3. Não têm operação criada
    // 4. Não foram verificadas ainda (dataVerificacaoNaoOperada é null)
    
    const todasPartidas = await db.select().from(partidas)
      .where(
        and(
          eq(partidas.status, 'PRE_ANALISE'),
          sql`${partidas.dataVerificacaoNaoOperada} IS NULL`
        )
      );
    
    // Filtrar partidas que passaram 24h
    const agora = new Date();
    const partidasElegiveis: Partida[] = [];
    
    for (const partida of todasPartidas) {
      const dataHoraPartida = new Date(`${partida.data}T${partida.hora}`);
      const diferencaHoras = (agora.getTime() - dataHoraPartida.getTime()) / (1000 * 60 * 60);
      
      // Se passaram mais de 24h
      if (diferencaHoras >= 24) {
        // Verificar se existe operação para esta partida
        const operacoesPartida = await db.select()
          .from(operacoes)
          .where(eq(operacoes.partidaId, partida.id));
        
        // Se não tem operação, adicionar à lista
        if (operacoesPartida.length === 0) {
          partidasElegiveis.push(partida);
        }
      }
    }
    
    return partidasElegiveis;
  }

  async marcarPartidaNaoOperada(id: number, justificativa: string): Promise<Partida | undefined> {
    const result = await db.update(partidas)
      .set({
        status: 'NAO_OPERADA',
        justificativaNaoOperada: justificativa,
        dataVerificacaoNaoOperada: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(partidas.id, id))
      .returning();
    return result[0];
  }

  async marcarPartidaVerificada(id: number): Promise<Partida | undefined> {
    // Marca partida como verificada sem alterar o status
    // Usado quando usuário confirma que foi operada e vai criar a operação
    const result = await db.update(partidas)
      .set({
        dataVerificacaoNaoOperada: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(partidas.id, id))
      .returning();
    return result[0];
  }

  // Pré-Análises
  async getAllPreAnalises(): Promise<PreAnalise[]> {
    return await db.select().from(preAnalises);
  }

  async getPreAnalisesComPartidas(): Promise<any[]> {
    // Retorna pré-análises junto com informações da partida (status, justificativa, etc)
    const result = await db.select({
      preAnalise: preAnalises,
      partida: partidas,
    })
    .from(preAnalises)
    .innerJoin(partidas, eq(preAnalises.partidaId, partidas.id))
    .orderBy(desc(partidas.data));
    
    return result;
  }

  async getPreAnaliseByPartidaId(partidaId: number): Promise<PreAnalise | undefined> {
    const result = await db.select().from(preAnalises).where(eq(preAnalises.partidaId, partidaId));
    return result[0];
  }

  async createPreAnalise(data: InsertPreAnalise): Promise<PreAnalise> {
    const result = await db.insert(preAnalises).values(data).returning();
    return result[0];
  }

  async updatePreAnalise(partidaId: number, data: Partial<InsertPreAnalise>): Promise<PreAnalise | undefined> {
    const result = await db.update(preAnalises).set({ ...data, updatedAt: new Date() }).where(eq(preAnalises.partidaId, partidaId)).returning();
    return result[0];
  }

  // Operações
  async getOperacoes(): Promise<Operacao[]> {
    return await db.select().from(operacoes).orderBy(desc(operacoes.dataHoraRegistro));
  }

  async getOperacaoById(id: number): Promise<Operacao | undefined> {
    const result = await db.select().from(operacoes).where(eq(operacoes.id, id));
    return result[0];
  }

  async getOperacoesByPartidaId(partidaId: number): Promise<Operacao[]> {
    return await db.select().from(operacoes).where(eq(operacoes.partidaId, partidaId));
  }

  async createOperacao(data: InsertOperacao): Promise<Operacao> {
    const result = await db.insert(operacoes).values(data).returning();
    return result[0];
  }

  async updateOperacao(id: number, data: Partial<Operacao>): Promise<Operacao | undefined> {
    const result = await db.update(operacoes).set({ ...data, updatedAt: new Date() }).where(eq(operacoes.id, id)).returning();
    return result[0];
  }

  async concluirOperacao(id: number): Promise<Operacao | undefined> {
    const result = await db.update(operacoes).set({
      status: 'CONCLUIDA',
      dataConclusao: new Date(),
      updatedAt: new Date(),
    }).where(eq(operacoes.id, id)).returning();
    return result[0];
  }

  async deleteOperacao(id: number): Promise<boolean> {
    const result = await db.delete(operacoes).where(eq(operacoes.id, id)).returning();
    return result.length > 0;
  }

  // Itens de Operação
  async getOperacaoItens(operacaoId: number): Promise<OperacaoItem[]> {
    return await db.select().from(operacaoItens).where(eq(operacaoItens.operacaoId, operacaoId));
  }

  async getOperacaoItemById(id: number): Promise<OperacaoItem | undefined> {
    const result = await db.select().from(operacaoItens).where(eq(operacaoItens.id, id));
    return result[0];
  }

  async createOperacaoItem(data: InsertOperacaoItem): Promise<OperacaoItem> {
    const result = await db.insert(operacaoItens).values({
      ...data,
      stake: data.stake.toString(),
      oddEntrada: data.oddEntrada.toString(),
      oddSaida: numberToString(data.oddSaida),
      resultadoFinanceiro: numberToString(data.resultadoFinanceiro),
    }).returning();
    return result[0];
  }

  async updateOperacaoItem(id: number, data: Partial<InsertOperacaoItem>): Promise<OperacaoItem | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.stake !== undefined) updateData.stake = data.stake.toString();
    if (data.oddEntrada !== undefined) updateData.oddEntrada = data.oddEntrada.toString();
    if (data.oddSaida !== undefined) updateData.oddSaida = numberToString(data.oddSaida);
    if (data.resultadoFinanceiro !== undefined) updateData.resultadoFinanceiro = numberToString(data.resultadoFinanceiro);
    const result = await db.update(operacaoItens).set(updateData).where(eq(operacaoItens.id, id)).returning();
    return result[0];
  }

  async deleteOperacaoItem(id: number): Promise<boolean> {
    const result = await db.delete(operacaoItens).where(eq(operacaoItens.id, id)).returning();
    return result.length > 0;
  }

  // Transações Financeiras
  async getTransacoesFinanceiras(): Promise<TransacaoFinanceira[]> {
    return await db.select().from(transacoesFinanceiras).orderBy(desc(transacoesFinanceiras.data), desc(transacoesFinanceiras.hora));
  }

  async getTransacaoFinanceiraById(id: number): Promise<TransacaoFinanceira | undefined> {
    const result = await db.select().from(transacoesFinanceiras).where(eq(transacoesFinanceiras.id, id));
    return result[0];
  }

  async createTransacaoFinanceira(data: InsertTransacaoFinanceira): Promise<TransacaoFinanceira> {
    const result = await db.insert(transacoesFinanceiras).values({
      ...data,
      valor: data.valor.toString(),
    }).returning();
    return result[0];
  }

  async updateTransacaoFinanceira(id: number, data: InsertTransacaoFinanceira): Promise<TransacaoFinanceira | undefined> {
    const result = await db.update(transacoesFinanceiras).set({
      data: data.data,
      hora: data.hora,
      valor: data.valor.toString(),
      tipo: data.tipo,
    }).where(eq(transacoesFinanceiras.id, id)).returning();
    return result[0];
  }

  async deleteTransacaoFinanceira(id: number): Promise<boolean> {
    const result = await db.delete(transacoesFinanceiras).where(eq(transacoesFinanceiras.id, id)).returning();
    return result.length > 0;
  }

  // Opções Customizadas
  async getOpcoesPorCampo(campo: string): Promise<OpcaoCustomizada[]> {
    return await db.select().from(opcoesCustomizadas).where(eq(opcoesCustomizadas.campo, campo)).orderBy(opcoesCustomizadas.ordem, opcoesCustomizadas.opcao);
  }

  async createOpcaoCustomizada(data: InsertOpcaoCustomizada): Promise<OpcaoCustomizada> {
    const result = await db.insert(opcoesCustomizadas).values(data).returning();
    return result[0];
  }

  async updateOpcaoCustomizada(id: number, data: Partial<InsertOpcaoCustomizada>): Promise<OpcaoCustomizada | undefined> {
    const result = await db.update(opcoesCustomizadas).set({ ...data, updatedAt: new Date() }).where(eq(opcoesCustomizadas.id, id)).returning();
    return result[0];
  }

  async deleteOpcaoCustomizada(id: number): Promise<boolean> {
    const result = await db.delete(opcoesCustomizadas).where(eq(opcoesCustomizadas.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
