import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Vote, BarChart3 } from 'lucide-react';

interface ElectionCardProps {
  id: number;
  title: string;
  description: string;
  endTime: number;
  active: boolean;
  totalVotes?: number;
}

export const ElectionCard = ({ id, title, description, endTime, active, totalVotes = 0 }: ElectionCardProps) => {
  const navigate = useNavigate();
  const timeLeft = endTime * 1000 - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <Badge variant={active ? "default" : "secondary"} className={active ? "bg-accent text-accent-foreground" : ""}>
          {active ? 'Active' : 'Ended'}
        </Badge>
      </div>
      
      <p className="text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{active ? (daysLeft > 0 ? `${daysLeft}d left` : `${hoursLeft}h left`) : 'Ended'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Vote className="h-4 w-4" />
          <span>{totalVotes} votes</span>
        </div>
      </div>

      <div className="flex gap-2">
        {active && (
          <Button
            onClick={() => navigate(`/vote/${id}`)}
            className="flex-1 bg-gradient-primary hover:opacity-90"
          >
            <Vote className="mr-2 h-4 w-4" />
            Vote Now
          </Button>
        )}
        <Button
          onClick={() => navigate(`/results/${id}`)}
          variant="outline"
          className={active ? "" : "flex-1"}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Results
        </Button>
      </div>
    </Card>
  );
};
