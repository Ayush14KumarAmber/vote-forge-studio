import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletButton } from '@/components/WalletButton';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, ArrowLeft, Trophy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface ElectionResults {
  title: string;
  description: string;
  candidates: string[];
  voteCounts: number[];
  active: boolean;
  endTime: number;
}

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contract } = useWeb3();
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    if (!contract || !id) {
      setLoading(false);
      return;
    }

    try {
      const details = await contract.getElectionDetails(Number(id));
      setResults({
        title: details.title,
        description: details.description,
        candidates: details.candidates,
        voteCounts: details.voteCounts.map((v: bigint) => Number(v)),
        active: details.active && Number(details.endTime) * 1000 > Date.now(),
        endTime: Number(details.endTime),
      });
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load election results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, [contract, id]);

  const chartData = results?.candidates.map((candidate, index) => ({
    name: candidate,
    votes: results.voteCounts[index],
  })) || [];

  const totalVotes = results?.voteCounts.reduce((sum, count) => sum + count, 0) || 0;
  const maxVotes = Math.max(...(results?.voteCounts || [0]));
  const winners = results?.candidates.filter((_, idx) => results.voteCounts[idx] === maxVotes) || [];

  const COLORS = ['hsl(263 70% 50%)', 'hsl(180 100% 50%)', 'hsl(280 80% 60%)', 'hsl(200 100% 60%)'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-xl">Election not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-primary/20 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary animate-glow" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Solet
            </h1>
          </div>
          <WalletButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={loadResults}
            className="border-accent/20 hover:bg-accent/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {results.title}
              </h2>
              <p className="text-muted-foreground">{results.description}</p>
            </div>
            <Badge variant={results.active ? "default" : "secondary"} className={results.active ? "bg-accent text-accent-foreground" : ""}>
              {results.active ? 'Live Results' : 'Final Results'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Votes: <span className="text-foreground font-bold text-lg">{totalVotes}</span>
          </div>
        </Card>

        {!results.active && winners.length > 0 && (
          <Card className="p-6 bg-gradient-primary/10 backdrop-blur-sm border-primary/40 mb-6 animate-glow">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-accent" />
              <div>
                <h3 className="text-xl font-bold">Winner{winners.length > 1 ? 's' : ''}</h3>
                <p className="text-lg text-foreground/90">
                  {winners.join(', ')} - {maxVotes} vote{maxVotes !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
          <h3 className="text-xl font-bold mb-6">Vote Distribution</h3>
          
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {results.candidates.map((candidate, index) => {
              const votes = results.voteCounts[index];
              const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{candidate}</span>
                    <span className="text-muted-foreground">
                      {votes} vote{votes !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Results;
