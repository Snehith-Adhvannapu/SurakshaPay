import TransactionCard from '../TransactionCard';

export default function TransactionCardExample() {
  //todo: remove mock functionality
  const mockTransaction = {
    id: "txn-001",
    type: "debit" as const,
    amount: 2500,
    description: "Payment to Local Grocery Store",
    timestamp: new Date().toISOString(),
    securityStatus: "verified" as const,
    location: "Village Market, Rajasthan"
  };

  const handleViewDetails = (id: string) => {
    console.log('View transaction details:', id);
  };

  return (
    <div className="p-4 max-w-md">
      <TransactionCard 
        transaction={mockTransaction} 
        onViewDetails={handleViewDetails} 
      />
    </div>
  );
}