import MetricCard from "../MetricCard";
import { TrendingUp, Target, BarChart3, Award } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Lucro Total" 
        value="R$ 2.345,50" 
        icon={TrendingUp}
        trend={{ value: "+12,5% vs. mês anterior", positive: true }}
      />
      <MetricCard 
        title="ROI" 
        value="8,3%" 
        icon={Target}
      />
      <MetricCard 
        title="Taxa de Acerto" 
        value="67%" 
        icon={Award}
      />
      <MetricCard 
        title="Média por Operação" 
        value="R$ 45,20" 
        icon={BarChart3}
      />
    </div>
  );
}
