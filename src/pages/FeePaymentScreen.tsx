import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvoices } from '@/hooks/useInvoices';
import { useParentData } from '@/hooks/useParentData';
import { useAuth } from '@/contexts/AuthContext';
import { ExportButton } from '@/components/common/ExportButton';
import { formatCurrency, formatDate } from '@/utils/exportUtils';
import { CheckCircle, XCircle, DollarSign, Clock, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const FeePaymentScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { isParent, isAdmin } = useAuth();
  const { connectedStudents } = useParentData();
  
  const studentIds = isParent() ? connectedStudents.map(s => s.id) : undefined;
  const { invoices, stats, isLoading, markAsPaid } = useInvoices(studentIds);

  const filteredInvoices = activeTab === 'all' 
    ? invoices 
    : activeTab === 'unpaid' 
      ? invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
      : invoices.filter(inv => inv.status === 'paid');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success';
      case 'unpaid': return 'bg-destructive/10 text-destructive';
      case 'overdue': return 'bg-warning/10 text-warning';
      case 'partial': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const exportColumns = [
    { header: 'Invoice #', accessor: 'invoice_number' },
    { header: 'Student', accessor: 'student_name' },
    { header: 'Title', accessor: 'title' },
    { header: 'Amount', accessor: 'amount', format: formatCurrency },
    { header: 'Paid', accessor: 'paid_amount', format: formatCurrency },
    { header: 'Due Date', accessor: 'due_date', format: formatDate },
    { header: 'Status', accessor: 'status' },
    { header: 'Paid At', accessor: 'paid_at', format: formatDate },
  ];

  return (
    <div className="screen-container">
      <PageHeader 
        title="Payments" 
        subtitle="View and manage fee payments"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 px-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/20">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.paidCount}</p>
                <p className="text-xs text-muted-foreground">Paid Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/20">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.unpaidCount}</p>
                <p className="text-xs text-muted-foreground">Due Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end px-4 mb-4">
        <ExportButton
          options={{
            title: 'Fee Payment Report',
            subtitle: `Generated on ${format(new Date(), 'PPP')}`,
            columns: exportColumns,
            data: invoices
          }}
          defaultFilename="fee-payments"
        />
      </div>

      {/* Invoice List */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="paid">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-muted-foreground">No invoices found</p>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{invoice.student_name}</p>
                          <p className="text-sm text-muted-foreground">{invoice.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn('mb-1', getStatusColor(invoice.status))}>
                          {invoice.status}
                        </Badge>
                        <p className="text-lg font-bold text-foreground">
                          ₹{Number(invoice.amount - (invoice.paid_amount || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Due date and action */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                      </div>
                      {invoice.status !== 'paid' && isAdmin() && (
                        <Button 
                          size="sm" 
                          onClick={() => markAsPaid(invoice.id)}
                          className="gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeePaymentScreen;
