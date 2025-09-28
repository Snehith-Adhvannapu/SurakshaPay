import SecurityBadge from '../SecurityBadge';

export default function SecurityBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <SecurityBadge status="verified" label="Transaction Verified" />
      <SecurityBadge status="pending" label="Checking Device" />
      <SecurityBadge status="warning" label="SIM Change Detected" />
      <SecurityBadge status="danger" label="Fraud Alert" />
    </div>
  );
}