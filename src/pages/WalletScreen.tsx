import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWallet, WalletTransaction } from '@/hooks/useWallet';
import { ExportButton } from '@/components/common/ExportButton';
import { formatCurrency, formatDate } from '@/utils/exportUtils';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const WalletScreen = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { transactions, currentBalance, summary, isLoading, addTransaction, isAdding } = useWallet();

  const handleAddTransaction = () => {
    if (!amount || Number(amount) <= 0) return;

    addTransaction({
      amount: Number(amount),
      transaction_type: transactionType,
      description: description || undefined
    });

    setAmount('');
    setDescription('');
    setIsAddDialogOpen(false);
  };

  const exportColumns = [
    { header: 'Date', accessor: 'created_at', format: formatDate },
    { header: 'Type', accessor: 'transaction_type' },
    { header: 'Amount', accessor: 'amount', format: formatCurrency },
    { header: 'Description', accessor: 'description' },
    { header: 'Balance After', accessor: 'balance_after', format: formatCurrency },
  ];

  return (
    <div className="screen-container">
      <PageHeader 
        title="Wallet" 
        subtitle="Manage your wallet balance and transactions"
      />

      {/* Balance Card */}
      <div className="px-4 mb-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Transaction Type</Label>
                      <Select value={transactionType} onValueChange={(v) => setTransactionType(v as 'credit' | 'debit')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit (Add Money)</SelectItem>
                          <SelectItem value="debit">Debit (Withdraw)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleAddTransaction}
                      disabled={isAdding || !amount}
                    >
                      {isAdding ? 'Processing...' : 'Add Transaction'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm opacity-80 mb-1">Current Balance</p>
            <p className="text-4xl font-bold font-display">₹{currentBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-success">₹{summary.totalCredits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-bold text-destructive">₹{summary.totalDebits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Debits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end px-4 mb-4">
        <ExportButton
          options={{
            title: 'Wallet Transactions Report',
            subtitle: `Current Balance: ₹${currentBalance.toLocaleString()}`,
            columns: exportColumns,
            data: transactions
          }}
          defaultFilename="wallet-transactions"
        />
      </div>

      {/* Transaction History */}
      <div className="px-4">
        <h3 className="font-semibold text-foreground mb-4">Transaction History</h3>
        
        {transactions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        transaction.transaction_type === 'credit' 
                          ? 'bg-success/10' 
                          : 'bg-destructive/10'
                      )}>
                        {transaction.transaction_type === 'credit' ? (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description || (transaction.transaction_type === 'credit' ? 'Money Added' : 'Money Withdrawn')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        transaction.transaction_type === 'credit' ? 'text-success' : 'text-destructive'
                      )}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ₹{Number(transaction.balance_after).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletScreen;
