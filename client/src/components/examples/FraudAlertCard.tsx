import FraudAlertCard from '../FraudAlertCard';

export default function FraudAlertCardExample() {
  //todo: remove mock functionality
  const mockAlert = {
    id: "alert-001",
    type: "sim_swap" as const,
    title: "SIM Card Change Detected",
    description: "We detected your SIM card was changed or replaced. If this was not done by you, please secure your account immediately.",
    severity: "danger" as const,
    timestamp: new Date().toISOString(),
    actionRequired: true
  };

  const handleDismiss = (id: string) => {
    console.log('Alert dismissed:', id);
  };

  const handleReportFalse = (id: string) => {
    console.log('Reporting unauthorized activity:', id);
  };

  return (
    <div className="p-4 max-w-md">
      <FraudAlertCard 
        alert={mockAlert}
        onDismiss={handleDismiss}
        onReportFalse={handleReportFalse}
      />
    </div>
  );
}