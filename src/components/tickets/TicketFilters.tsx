
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
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
    <div className="space-y-4 mb-6">
      {/* Barra de pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Pesquisar por título do ticket..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Filtro por Status */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Data De */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Data de</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFromFilter ? (
                  format(dateFromFilter, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecionar data</span>
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
        </div>

        {/* Filtro por Data Até */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Data até</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateToFilter ? (
                  format(dateToFilter, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecionar data</span>
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
        </div>

        {/* Botão Limpar Filtros */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium opacity-0">Ações</label>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;
