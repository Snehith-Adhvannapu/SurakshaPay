import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type SecurityStatus = "verified" | "pending" | "warning" | "danger";

interface SecurityBadgeProps {
  status: SecurityStatus;
  label: string;
  className?: string;
}

const securityConfig = {
  verified: {
    icon: ShieldCheck,
    className: "bg-security-verified text-white",
    label: "Secure"
  },
  pending: {
    icon: Clock,
    className: "bg-security-pending text-black",
    label: "Verifying"
  },
  warning: {
    icon: ShieldAlert,
    className: "bg-security-warning text-black",
    label: "Caution"
  },
  danger: {
    icon: Shield,
    className: "bg-security-danger text-white",
    label: "Alert"
  }
};

export default function SecurityBadge({ status, label, className }: SecurityBadgeProps) {
  const config = securityConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      className={cn(
        config.className,
        "gap-1 text-sm font-medium px-2 py-1",
        className
      )}
      data-testid={`badge-security-${status}`}
    >
      <Icon className="w-3 h-3" />
      {label || config.label}
    </Badge>
  );
}