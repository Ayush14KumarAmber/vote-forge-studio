import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';

export const WalletButton = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-lg bg-card border border-primary/20 backdrop-blur-sm">
          <p className="text-sm font-mono text-primary">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={disconnectWallet}
          className="border-destructive/20 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-gradient-primary hover:opacity-90 transition-opacity"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};
