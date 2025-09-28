import BalanceCard from '../BalanceCard';

export default function BalanceCardExample() {
  //todo: remove mock functionality
  const handleRefresh = () => {
    console.log('Balance refreshed');
  };

  return (
    <div className="p-4 max-w-md">
      <BalanceCard 
        balance={45720.50}
        accountNumber="1234567890"
        lastUpdated={new Date().toISOString()}
        securityStatus="verified"
        onRefresh={handleRefresh}
      />
    </div>
  );
}