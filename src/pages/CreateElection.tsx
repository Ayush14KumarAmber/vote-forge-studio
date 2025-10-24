import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WalletButton } from '@/components/WalletButton';
import { useWeb3 } from '@/contexts/Web3Context';
import { Shield, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const electionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
});

const CreateElection = () => {
  const navigate = useNavigate();
  const { contract, account } = useWeb3();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [candidates, setCandidates] = useState(['', '']);
  const [duration, setDuration] = useState(24);
  const [creating, setCreating] = useState(false);

  const addCandidate = () => {
    setCandidates([...candidates, '']);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const updateCandidate = (index: number, value: string) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  const handleCreate = async () => {
    if (!contract || !account) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      electionSchema.parse({ title, description, duration });

      const validCandidates = candidates.filter((c) => c.trim() !== '');
      if (validCandidates.length < 2) {
        toast({
          title: 'Invalid Input',
          description: 'At least 2 candidates are required',
          variant: 'destructive',
        });
        return;
      }

      setCreating(true);
      const durationInSeconds = duration * 3600;
      const tx = await contract.createElection(title, description, validCandidates, durationInSeconds);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Creating your election...',
      });

      await tx.wait();

      toast({
        title: 'Success!',
        description: 'Your election has been created',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error creating election:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create election',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

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

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Create New Election
          </h2>
          <p className="text-muted-foreground mb-8">
            Set up a transparent and secure voting election on the blockchain
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Community Leader Election 2024"
                className="mt-2 bg-background/50 border-primary/20"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this election is about..."
                className="mt-2 bg-background/50 border-primary/20 min-h-24"
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={720}
                className="mt-2 bg-background/50 border-primary/20"
              />
            </div>

            <div>
              <Label>Candidates / Options</Label>
              <div className="space-y-3 mt-2">
                {candidates.map((candidate, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={candidate}
                      onChange={(e) => updateCandidate(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="bg-background/50 border-primary/20"
                      maxLength={100}
                    />
                    {candidates.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeCandidate(index)}
                        className="border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={addCandidate}
                className="mt-3 w-full border-accent/20 hover:bg-accent/10"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>

            <Button
              onClick={handleCreate}
              disabled={creating || !account}
              className="w-full bg-gradient-primary hover:opacity-90 h-12 text-lg"
            >
              {creating ? 'Creating...' : 'Create Election'}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CreateElection;
