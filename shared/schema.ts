import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer,
  date,
  time,
  numeric,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const partidaStatusEnum = pgEnum('partida_status', [
  'PRE_ANALISE',
  'OPERACAO_PENDENTE', 
  'OPERACAO_CONCLUIDA',
  'NAO_OPERADA'
]);

export const operacaoStatusEnum = pgEnum('operacao_status', [
  'PENDENTE',
  'CONCLUIDA'
]);

export const tipoTransacaoEnum = pgEnum('tipo_transacao', [
  'DEPOSITO',
  'SAQUE'
]);

export const tipoEncerramentoEnum = pgEnum('tipo_encerramento', [
  'Automático',
  'Manual',
  'Parcial'
]);

// Cadastros Base
export const equipes = pgTable("equipes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: varchar("nome", { length: 30 }).notNull(),
  nomeNormalizado: varchar("nome_normalizado", { length: 30 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const competicoes = pgTable("competicoes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: varchar("nome", { length: 30 }).notNull(),
  nomeNormalizado: varchar("nome_normalizado", { length: 30 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mercados = pgTable("mercados", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nome: varchar("nome", { length: 30 }).notNull(),
  nomeNormalizado: varchar("nome_normalizado", { length: 30 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const estrategias = pgTable("estrategias", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mercadoId: integer("mercado_id").notNull().references(() => mercados.id),
  nome: varchar("nome", { length: 30 }).notNull(),
  nomeNormalizado: varchar("nome_normalizado", { length: 30 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partidas
export const partidas = pgTable("partidas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  data: date("data").notNull(),
  hora: time("hora").notNull(),
  competicaoId: integer("competicao_id").notNull().references(() => competicoes.id),
  mandanteId: integer("mandante_id").notNull().references(() => equipes.id),
  visitanteId: integer("visitante_id").notNull().references(() => equipes.id),
  oddMandante: numeric("odd_mandante", { precision: 10, scale: 2 }),
  oddVisitante: numeric("odd_visitante", { precision: 10, scale: 2 }),
  oddEmpate: numeric("odd_empate", { precision: 10, scale: 2 }),
  status: partidaStatusEnum("status").notNull().default('PRE_ANALISE'),
  justificativaNaoOperada: text("justificativa_nao_operada"),
  dataVerificacaoNaoOperada: timestamp("data_verificacao_nao_operada"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Pré-Análises
export const preAnalises = pgTable("pre_analises", {
  partidaId: integer("partida_id").primaryKey().references(() => partidas.id),
  classificacaoM: varchar("classificacao_m", { length: 2 }),
  classificacaoV: varchar("classificacao_v", { length: 2 }),
  momentoM: varchar("momento_m", { length: 30 }),
  momentoV: varchar("momento_v", { length: 30 }),
  mustWinM: varchar("must_win_m", { length: 40 }),
  mustWinV: varchar("must_win_v", { length: 40 }),
  importanciaProxPartidaM: varchar("importancia_prox_partida_m", { length: 30 }),
  importanciaProxPartidaV: varchar("importancia_prox_partida_v", { length: 30 }),
  desfalquesM: varchar("desfalques_m", { length: 30 }),
  desfalquesV: varchar("desfalques_v", { length: 30 }),
  tendenciaEsperada: varchar("tendencia_esperada", { length: 30 }),
  desempenhoCasaM: varchar("desempenho_casa_m", { length: 30 }),
  desempenhoForaV: varchar("desempenho_fora_v", { length: 30 }),
  valorPotencial: varchar("valor_potencial", { length: 30 }),
  destaqueEssencial: text("destaque_essencial"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Histórico de Pré-Análises não operadas
export const historicoPreAnalise = pgTable("historico_pre_analise", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  partidaId: integer("partida_id").notNull().references(() => partidas.id),
  justificativaNaoOperacao: varchar("justificativa_nao_operacao", { length: 50 }),
  dataEnvioHistorico: date("data_envio_historico").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Operações
export const operacoes = pgTable("operacoes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  partidaId: integer("partida_id").notNull().references(() => partidas.id),
  status: operacaoStatusEnum("status").notNull().default('PENDENTE'),
  dataHoraRegistro: timestamp("data_hora_registro").defaultNow().notNull(),
  dataConclusao: timestamp("data_conclusao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Itens de Operação
export const operacaoItens = pgTable("operacao_itens", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  operacaoId: integer("operacao_id").notNull().references(() => operacoes.id, { onDelete: 'cascade' }),
  mercadoId: integer("mercado_id").notNull().references(() => mercados.id),
  estrategiaId: integer("estrategia_id").notNull().references(() => estrategias.id),
  stake: numeric("stake", { precision: 10, scale: 2 }).notNull(),
  resultadoFinanceiro: numeric("resultado_financeiro", { precision: 10, scale: 2 }),
  oddEntrada: numeric("odd_entrada", { precision: 10, scale: 2 }).notNull(),
  tipoEncerramento: tipoEncerramentoEnum("tipo_encerramento"),
  oddSaida: numeric("odd_saida", { precision: 10, scale: 2 }),
  tempoExposicaoMin: integer("tempo_exposicao_min"),
  seguiuPlano: boolean("seguiu_plano"),
  estadoEmocional: varchar("estado_emocional", { length: 50 }),
  motivacaoEntrada: varchar("motivacao_entrada", { length: 50 }),
  autoavaliacao: varchar("autoavaliacao", { length: 50 }),
  motivacaoSaidaObservacao: text("motivacao_saida_observacao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert Schemas para validação
export const insertEquipeSchema = z.object({
  nome: z.string().min(1).max(30),
});

export const insertCompeticaoSchema = z.object({
  nome: z.string().min(1).max(30),
});

export const insertMercadoSchema = z.object({
  nome: z.string().min(1).max(30),
});

export const insertEstrategiaSchema = z.object({
  mercadoId: z.number().int().positive(),
  nome: z.string().min(1).max(30),
});

export const insertPartidaSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hora: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora deve estar no formato HH:MM ou HH:MM:SS"),
  competicaoId: z.number().int().positive(),
  mandanteId: z.number().int().positive(),
  visitanteId: z.number().int().positive(),
  oddMandante: z.number().min(1.01).optional(),
  oddVisitante: z.number().min(1.01).optional(),
  oddEmpate: z.number().min(1.01).optional(),
});

export const insertPreAnaliseSchema = z.object({
  partidaId: z.number().int().positive(),
  classificacaoM: z.string().max(2).optional(),
  classificacaoV: z.string().max(2).optional(),
  momentoM: z.string().max(30).optional(),
  momentoV: z.string().max(30).optional(),
  mustWinM: z.string().max(40).optional(),
  mustWinV: z.string().max(40).optional(),
  importanciaProxPartidaM: z.string().max(30).optional(),
  importanciaProxPartidaV: z.string().max(30).optional(),
  desfalquesM: z.string().max(30).optional(),
  desfalquesV: z.string().max(30).optional(),
  tendenciaEsperada: z.string().max(30).optional(),
  desempenhoCasaM: z.string().max(30).optional(),
  desempenhoForaV: z.string().max(30).optional(),
  valorPotencial: z.string().max(30).optional(),
  destaqueEssencial: z.string().max(300).optional(),
});

export const insertOperacaoSchema = z.object({
  partidaId: z.number().int().positive(),
});

export const insertOperacaoItemSchema = z.object({
  operacaoId: z.number().int().positive(),
  mercadoId: z.number().int().positive(),
  estrategiaId: z.number().int().positive(),
  stake: z.number().positive({ message: "Stake deve ser maior que 0" }),
  resultadoFinanceiro: z.number().optional(),
  oddEntrada: z.number().min(1.01, { message: "Odd entrada deve ser maior que 1.01" }),
  tipoEncerramento: z.enum(['Automático', 'Manual', 'Parcial']).optional(),
  oddSaida: z.number().min(1.01, { message: "Odd saída deve ser maior que 1.01" }).optional(),
  tempoExposicaoMin: z.number().int().min(0).optional(),
  seguiuPlano: z.boolean().optional(),
  estadoEmocional: z.string().max(50).optional(),
  motivacaoEntrada: z.string().max(50).optional(),
  autoavaliacao: z.string().max(50).optional(),
  motivacaoSaidaObservacao: z.string().max(400).optional(),
});

// Types
export type Equipe = typeof equipes.$inferSelect;
export type InsertEquipe = z.infer<typeof insertEquipeSchema>;

export type Competicao = typeof competicoes.$inferSelect;
export type InsertCompeticao = z.infer<typeof insertCompeticaoSchema>;

export type Mercado = typeof mercados.$inferSelect;
export type InsertMercado = z.infer<typeof insertMercadoSchema>;

export type Estrategia = typeof estrategias.$inferSelect;
export type InsertEstrategia = z.infer<typeof insertEstrategiaSchema>;

export type Partida = typeof partidas.$inferSelect;
export type InsertPartida = z.infer<typeof insertPartidaSchema>;

export type PreAnalise = typeof preAnalises.$inferSelect;
export type InsertPreAnalise = z.infer<typeof insertPreAnaliseSchema>;

export type Operacao = typeof operacoes.$inferSelect;
export type InsertOperacao = z.infer<typeof insertOperacaoSchema>;

export type OperacaoItem = typeof operacaoItens.$inferSelect;
export type InsertOperacaoItem = z.infer<typeof insertOperacaoItemSchema>;

// Transações Financeiras (Saques e Depósitos)
export const transacoesFinanceiras = pgTable("transacoes_financeiras", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  data: date("data").notNull(),
  hora: time("hora").notNull(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  tipo: tipoTransacaoEnum("tipo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Opções Customizadas
export const opcoesCustomizadas = pgTable("opcoes_customizadas", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  campo: varchar("campo", { length: 50 }).notNull(),
  opcao: varchar("opcao", { length: 100 }).notNull(),
  ordem: integer("ordem").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTransacaoFinanceiraSchema = z.object({
  data: z.string(),
  hora: z.string(),
  valor: z.number().positive({ message: "Valor deve ser maior que 0" }),
  tipo: z.enum(['DEPOSITO', 'SAQUE']),
});

export type TransacaoFinanceira = typeof transacoesFinanceiras.$inferSelect;
export type InsertTransacaoFinanceira = z.infer<typeof insertTransacaoFinanceiraSchema>;

export const insertOpcaoCustomizadaSchema = z.object({
  campo: z.string().min(1).max(50),
  opcao: z.string().min(1).max(100),
  ordem: z.number().int().min(0).default(0),
});

export type OpcaoCustomizada = typeof opcoesCustomizadas.$inferSelect;
export type InsertOpcaoCustomizada = z.infer<typeof insertOpcaoCustomizadaSchema>;
