import { Button } from "@/components/ui/button";
import { Home, CreditCard, Shield, Settings, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const getNavItems = (t: any) => [
  { icon: Home, label: t('nav.home'), path: "/" },
  { icon: CreditCard, label: t('nav.transactions'), path: "/transactions" },
  { icon: Shield, label: t('nav.security'), path: "/security" },
  { icon: Activity, label: 'Live Demo', path: "/live-dashboard" },
  { icon: Settings, label: t('common.settings'), path: "/settings" }
];

export default function BottomNavigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const navItems = getNavItems(t);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-12 px-1 ${
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