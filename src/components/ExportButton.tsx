import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, FileSpreadsheet } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface ExportButtonProps {
  data: any;
  location: string;
}

const ExportButton = ({ data, location }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = () => {
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      saveAs(blob, `weather-data-${location}-${new Date().toISOString()}.json`);
      toast.success("Dados exportados em JSON com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const csv = [
        ["Métrica", "Valor"],
        ["Localização", location],
        ["Temperatura", `${data.temperature}°C`],
        ["Umidade", `${data.humidity}%`],
        ["Chuva", `${data.rainfall}mm`],
        ["Vento", `${data.wind} km/h`],
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `weather-data-${location}-${new Date().toISOString()}.csv`);
      toast.success("Dados exportados em CSV com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = () => {
    toast.info("Exportação em PDF será implementada com a API Python");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting} className="gap-2">
          <Download className="h-4 w-4" />
          {isExporting ? "Exportando..." : "Baixar Dados"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem onClick={exportJSON} className="gap-2 cursor-pointer">
          <FileJson className="h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
