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
  items?: T[]; // <- agora é opcional, evita undefined
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  showMercado?: boolean;
  gridColumns?: 2 | 3 | 4;
  orderBy?: keyof T & string;
};

function gridClass(cols: 2 | 3 | 4 | undefined) {
  switch (cols) {
    case 2:
      return "grid grid-cols-1 sm:grid-cols-2 gap-3";
    case 3:
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3";
    case 4:
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
    items = [], // <- fallback: array vazio se undefined
    isLoading,
    onAdd,
    onEdit,
    onDelete,
    showMercado,
    gridColumns,
    orderBy,
  } = props;

  const orderedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (!orderBy) return items;
    return [...items].sort((a, b) => {
      const av = (a as any)[orderBy];
      const bv = (b as any)[orderBy];
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv, "pt-BR");
      }
      if (av < bv) return -1;
      if (av > bv) return 1;
      return 0;
    });
  }, [items, orderBy]);

  const isGrid = Boolean(gridColumns);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : orderedItems.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      ) : isGrid ? (
        /* ======= MODO GRADE ======= */
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
                    {item?.nome ?? `ID ${item.id}`}
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
        /* ======= MODO TABELA ======= */
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
                    {item?.nome ?? `ID ${item.id}`}
                  </TableCell>
                  {showMercado && (
                    <TableCell>{(item as any).mercado ?? "-"}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(item)}
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
