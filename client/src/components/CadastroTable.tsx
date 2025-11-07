import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CadastroItem {
  id: number;
  nome: string;
  mercado?: string;
}

interface CadastroTableProps {
  title: string;
  items: CadastroItem[];
  showMercado?: boolean;
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (item: CadastroItem) => void;
  onDelete: (item: CadastroItem) => void;
}

export default function CadastroTable({
  title,
  items,
  showMercado = false,
  isLoading = false,
  onAdd,
  onEdit,
  onDelete,
}: CadastroTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredItems = items.filter((item) =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: CadastroItem) => {
    setOpen(false);
    setSearchTerm("");
    onEdit(item);
  };

  const handleDelete = (item: CadastroItem) => {
    setOpen(false);
    setSearchTerm("");
    onDelete(item);
  };

  return (
    <div className="space-y-4" data-testid={`table-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  placeholder={`Buscar ${title.toLowerCase()} para editar ou excluir...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setOpen(e.target.value.length > 0);
                  }}
                  onFocus={() => {
                    if (searchTerm.length > 0) setOpen(true);
                  }}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} value={searchTerm} onValueChange={setSearchTerm} />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.nome}
                        className="flex items-center justify-between"
                        onSelect={() => {}}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.nome}</div>
                          {showMercado && item.mercado && (
                            <div className="text-xs text-muted-foreground">{item.mercado}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={onAdd} data-testid="button-add">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {showMercado && <TableHead>Mercado</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={showMercado ? 2 : 1}
                  className="text-center py-8 text-muted-foreground"
                >
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showMercado ? 2 : 1}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  {showMercado && <TableCell className="text-muted-foreground">{item.mercado}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
