import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNavigation from "@/components/BottomNavigation";
import ThemeToggle from "@/components/ThemeToggle";
import Home from "@/pages/Home";
import Transactions from "@/pages/Transactions";
import Security from "@/pages/Security";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <Route path="/settings" component={() => (
        <div className="min-h-screen bg-background pb-20">
          <div className="bg-primary text-primary-foreground p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm opacity-90">App preferences and configuration</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <div className="p-4">
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                window.location.reload();
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )} />
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
