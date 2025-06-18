
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFromFilter: Date | undefined;
  onDateFromFilterChange: (date: Date | undefined) => void;
  dateToFilter: Date | undefined;
  onDateToFilterChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFromFilter,
  onDateFromFilterChange,
  dateToFilter,
  onDateToFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Barra de pesquisa */}
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Pesquisar por título..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtro por status */}
        <div className="min-w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os status</option>
            <option value="new">Novo</option>
            <option value="open">Aberto</option>
            <option value="closed">Fechado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>

        {/* Data inicial */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-48 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFromFilter ? (
                format(dateFromFilter, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                "Data inicial"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFromFilter}
              onSelect={onDateFromFilterChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Data final */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-48 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateToFilter ? (
                format(dateToFilter, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                "Data final"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateToFilter}
              onSelect={onDateToFilterChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Botão para limpar filtros */}
        <Button variant="outline" onClick={onClearFilters}>
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default TicketFilters;
