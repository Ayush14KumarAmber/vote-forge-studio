import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletButton } from '@/components/WalletButton';
import { ElectionCard } from '@/components/ElectionCard';
import { useWeb3 } from '@/contexts/Web3Context';
import { PlusCircle, Vote, Shield, BarChart3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Election {
  id: number;
  title: string;
  description: string;
  endTime: number;
  active: boolean;
  totalVotes: number;
}

const Index = () => {
  const { contract, account } = useWeb3();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const loadElections = async () => {
    if (!contract) {
      setLoading(false);
      return;
    }

    try {
      const count = await contract.getElectionCount();
      const loadedElections: Election[] = [];

      for (let i = 0; i < Number(count); i++) {
        const details = await contract.getElectionDetails(i);
        const totalVotes = details.voteCounts.reduce(
          (sum: number, votes: bigint) => sum + Number(votes),
          0
        );

        loadedElections.push({
          id: i,
          title: details.title,
          description: details.description,
          endTime: Number(details.endTime),
          active: details.active && Number(details.endTime) * 1000 > Date.now(),
          totalVotes,
        });
      }

      setElections(loadedElections);
    } catch (error) {
      console.error('Error loading elections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load elections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, [contract]);

  const activeElections = elections.filter((e) => e.active);
  const endedElections = elections.filter((e) => !e.active);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="border-b border-primary/20 backdrop-blur-sm bg-background/50 sticky top-0 z-50">
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

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-float">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Decentralized Voting Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create transparent, secure elections on the blockchain. Your vote, your voice, immutably recorded.
          </p>

          {account && (
            <Link to="/create">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 animate-glow">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Election
              </Button>
            </Link>
          )}
        </div>

        {!account && (
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4 animate-glow" />
              <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your MetaMask wallet to start voting or create your own elections
              </p>
              <WalletButton />
            </Card>
          </div>
        )}

        {loading && account && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading elections...</p>
          </div>
        )}

        {!loading && elections.length === 0 && account && (
          <div className="text-center py-12">
            <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Elections Yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create an election!</p>
            <Link to="/create">
              <Button className="bg-gradient-primary hover:opacity-90">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create First Election
              </Button>
            </Link>
          </div>
        )}

        {activeElections.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-6 w-6 text-accent" />
              <h3 className="text-2xl font-bold">Active Elections</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeElections.map((election) => (
                <ElectionCard key={election.id} {...election} />
              ))}
            </div>
          </div>
        )}

        {endedElections.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Past Elections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedElections.map((election) => (
                <ElectionCard key={election.id} {...election} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
