import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNavigation from "@/components/BottomNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import Home from "@/pages/Home";
import Transactions from "@/pages/Transactions";
import Security from "@/pages/Security";
import LiveDashboard from "@/pages/LiveDashboard";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import AgentManagement from "@/pages/AgentManagement";
import RiskAssessment from "@/pages/RiskAssessment";
import CostSavings from "@/pages/CostSavings";
import TazamaIntegration from "@/pages/TazamaIntegration";
import LightweightML from "@/pages/LightweightML";
import DeviceFingerprinting from "@/pages/DeviceFingerprinting";
import SuccessMetrics from "@/pages/SuccessMetrics";
import OfflineCapabilities from "@/pages/OfflineCapabilities";
import LibsodiumEncryption from "@/pages/LibsodiumEncryption";
import SMSFallback from "@/pages/SMSFallback";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/security" component={Security} />
      <Route path="/live-dashboard" component={LiveDashboard} />
      <Route path="/compliance" component={ComplianceDashboard} />
      <Route path="/agents" component={AgentManagement} />
      <Route path="/risk-assessment" component={RiskAssessment} />
      <Route path="/cost-savings" component={CostSavings} />
      <Route path="/tazama" component={TazamaIntegration} />
      <Route path="/ml-models" component={LightweightML} />
      <Route path="/device-fingerprinting" component={DeviceFingerprinting} />
      <Route path="/success-metrics" component={SuccessMetrics} />
      <Route path="/offline-capabilities" component={OfflineCapabilities} />
      <Route path="/libsodium-encryption" component={LibsodiumEncryption} />
      <Route path="/sms-fallback" component={SMSFallback} />
      <Route path="/settings" component={() => {
        const { t } = useTranslation();
        return (
          <div className="min-h-screen bg-background pb-20">
            <div className="bg-primary text-primary-foreground p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">{t('common.settings')}</h1>
                  <p className="text-sm opacity-90">App preferences and configuration</p>
                </div>
                <div className="flex gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{t('common.language')}</h3>
                <p className="text-sm text-muted-foreground mb-3">Choose your preferred language for the interface</p>
                <LanguageSelector />
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userId');
                  window.location.reload();
                }}
                className="w-full"
              >
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        );
      }} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          <Router />
          <BottomNavigation />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
