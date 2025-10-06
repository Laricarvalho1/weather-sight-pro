import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const UnitsModal = () => {
  const [isMetric, setIsMetric] = useState(true);

  const units = [
    { metric: "°C (Celsius)", imperial: "°F (Fahrenheit)", label: "Temperatura" },
    { metric: "km/h (Quilômetros por hora)", imperial: "mph (Milhas por hora)", label: "Velocidade do Vento" },
    { metric: "mm (Milímetros)", imperial: "in (Polegadas)", label: "Precipitação" },
    { metric: "% (Porcentagem)", imperial: "% (Porcentagem)", label: "Umidade" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Unidades
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Units of Measurement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-foreground">Measurement System</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Imperial</span>
              <Switch checked={isMetric} onCheckedChange={setIsMetric} />
              <span className="text-sm text-muted-foreground">Metric</span>
            </div>
          </div>

          <div className="space-y-3">
            {units.map((unit, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b border-border">
                <span className="text-sm font-medium text-foreground">{unit.label}</span>
                <span className="text-sm text-muted-foreground">
                  {isMetric ? unit.metric : unit.imperial}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-info/10 p-3 rounded-lg border border-info/20">
            <p className="text-xs text-info">
              💡 SI (International System) units are used by default for scientific accuracy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitsModal;
