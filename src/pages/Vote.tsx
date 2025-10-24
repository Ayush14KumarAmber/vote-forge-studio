import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WalletButton } from '@/components/WalletButton';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, ArrowLeft, Vote as VoteIcon, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ElectionDetails {
  title: string;
  description: string;
  candidates: string[];
  endTime: number;
  active: boolean;
}

const Vote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contract, account } = useWeb3();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElection();
  }, [contract, id]);

  const loadElection = async () => {
    if (!contract || !id) {
      setLoading(false);
      return;
    }

    try {
      const details = await contract.getElectionDetails(Number(id));
      setElection({
        title: details.title,
        description: details.description,
        candidates: details.candidates,
        endTime: Number(details.endTime),
        active: details.active && Number(details.endTime) * 1000 > Date.now(),
      });
    } catch (error) {
      console.error('Error loading election:', error);
      toast({
        title: 'Error',
        description: 'Failed to load election details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!contract || !account || !selectedCandidate) return;

    try {
      setVoting(true);
      const candidateIndex = Number(selectedCandidate);
      const tx = await contract.vote(Number(id), candidateIndex);

      toast({
        title: 'Transaction Submitted',
        description: 'Casting your vote...',
      });

      await tx.wait();

      toast({
        title: 'Vote Cast Successfully!',
        description: 'Your vote has been recorded on the blockchain',
      });

      setTimeout(() => navigate(`/results/${id}`), 2000);
    } catch (error: any) {
      console.error('Error voting:', error);
      const message = error.message.includes('already voted')
        ? 'You have already voted in this election'
        : 'Failed to cast vote';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!election) {
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
              VoteChain
            </h1>
          </div>
          <WalletButton />
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 mb-6">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            {election.title}
          </h2>
          <p className="text-muted-foreground">{election.description}</p>
        </Card>

        {!election.active ? (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 text-center">
            <p className="text-xl text-muted-foreground">This election has ended</p>
            <Button onClick={() => navigate(`/results/${id}`)} className="mt-4">
              View Results
            </Button>
          </Card>
        ) : !account ? (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20 text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4 animate-glow" />
            <p className="text-xl mb-4">Connect your wallet to vote</p>
            <WalletButton />
          </Card>
        ) : (
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <VoteIcon className="h-5 w-5 text-primary" />
              Cast Your Vote
            </h3>

            <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <div className="space-y-3">
                {election.candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedCandidate === String(index)
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedCandidate(String(index))}
                  >
                    <RadioGroupItem value={String(index)} id={`candidate-${index}`} />
                    <Label htmlFor={`candidate-${index}`} className="flex-1 cursor-pointer text-lg">
                      {candidate}
                    </Label>
                    {selectedCandidate === String(index) && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={handleVote}
              disabled={!selectedCandidate || voting}
              className="w-full mt-6 bg-gradient-primary hover:opacity-90 h-12 text-lg"
            >
              {voting ? 'Casting Vote...' : 'Cast Vote'}
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Vote;
