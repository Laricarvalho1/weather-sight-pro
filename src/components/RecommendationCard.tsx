import { LucideIcon } from "lucide-react";

interface RecommendationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const RecommendationCard = ({ icon: Icon, title, description }: RecommendationCardProps) => {
  return (
    <div className="weather-card flex items-start gap-4 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;
