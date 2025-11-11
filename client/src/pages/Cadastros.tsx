import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type CadastroTableProps<T extends { id: number; nome?: string }> = {
  title: string;
  items: T[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  /** já existia em estratégias; continua valendo para o modo tabela */
  showMercado?: boolean;
  /** NOVO: quando definido, ativa o modo grade */
  gridColumns?: 2 | 3 | 4;
  /** NOVO: campo para ordenar (ex.: "nome"). Se presente, o componente ordena internamente. */
  orderBy?: keyof T & string;
};

/** classes de coluna responsivas fixas (Tailwind precisa de classes estáticas) */
function gridClass(cols: 2 | 3 | 4 | undefined) {
  switch (cols) {
    case 2:
      // celular 1, sm 2, md 2, lg 2
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3";
    case 3:
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3";
    case 4:
      // celular 1, sm 2, md 3, lg 4
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3";
    default:
      return "";
  }
}

export default function CadastroTable<T extends { id: number; nome?: string }>(
  props: CadastroTableProps<T>
) {
  const {
    title,
    items,
    isLoading,
    onAdd,
    onEdit,
    onDelete,
    showMercado,
    gridColumns,
    orderBy,
  } = props;

  // Ordenação opcional interna (caso prefira não ordenar na chamada)
  const orderedItems = useMemo(() => {
    if (!orderBy) return items;
    // se o campo existir e for string, usa localeCompare pt-BR
    return [...items].sort((a, b) => {
      const av = (a as any)[orderBy];
      const bv = (b as any)[orderBy];
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv, "pt-BR");
      }
      // fallback
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
  }, [items, orderBy]);

  const isGrid = Boolean(gridColumns);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Loading simples */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : orderedItems.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      ) : isGrid ? (
        /* ======= MODO GRADE (2 ou 4 colunas) ======= */
        <div className={gridClass(gridColumns)}>
          {orderedItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group rounded-xl border p-3",
                "bg-white/60 dark:bg-primary/5",
                "hover:shadow-sm hover:border-primary/40 transition"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {/* mostra somente o nome no cartão */}
                    {("nome" in item && item.nome) ? (item as any).nome : `ID ${item.id}`}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                    aria-label="Editar"
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    aria-label="Excluir"
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ======= MODO TABELA (comportamento existente preservado) ======= */
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                {showMercado && <TableHead>Mercado</TableHead>}
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {("nome" in item && item.nome) ? (item as any).nome : `ID ${item.id}`}
                  </TableCell>
                  {showMercado && (
                    <TableCell>
                      {(item as any).mercado ?? "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(item)}
                        aria-label="Editar"
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(item)}
                        aria-label="Excluir"
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
