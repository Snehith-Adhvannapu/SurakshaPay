import { Button } from "@/components/ui/button";
import { Home, CreditCard, Shield, Settings } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: CreditCard, label: "Transactions", path: "/transactions" },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-12 px-3 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => {
                console.log(`Navigating to ${item.path}`);
                window.history.pushState({}, '', item.path);
              }}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}