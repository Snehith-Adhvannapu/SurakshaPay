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
import NotFound from "@/pages/not-found";

function Router() {
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
            <div className="text-center py-12">
              <p className="text-muted-foreground">Settings page coming soon...</p>
            </div>
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
