import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SecurityBadge from "./SecurityBadge";
import { Smartphone, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface AuthenticationCardProps {
  title: string;
  onAuthenticate: (pin: string) => void;
  isLoading?: boolean;
  deviceStatus?: "trusted" | "new" | "suspicious";
}

export default function AuthenticationCard({ 
  title, 
  onAuthenticate, 
  isLoading = false,
  deviceStatus = "trusted" 
}: AuthenticationCardProps) {
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"device" | "pin" | "sms">("device");

  const deviceConfig = {
    trusted: {
      icon: CheckCircle,
      status: "verified" as const,
      message: "Device recognized and secure",
      className: "text-green-600"
    },
    new: {
      icon: Smartphone,
      status: "pending" as const,
      message: "New device detected - extra verification needed",
      className: "text-amber-600"
    },
    suspicious: {
      icon: AlertTriangle,
      status: "danger" as const,
      message: "Suspicious activity detected",
      className: "text-red-600"
    }
  };

  const currentDevice = deviceConfig[deviceStatus];
  const DeviceIcon = currentDevice.icon;

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      console.log('PIN authentication attempted');
      if (deviceStatus === "trusted") {
        onAuthenticate(pin);
      } else {
        setStep("sms");
      }
    }
  };

  const handleSmsVerify = () => {
    console.log('SMS verification completed');
    onAuthenticate(pin);
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-authentication">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Status */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
          <DeviceIcon className={`w-5 h-5 ${currentDevice.className}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">Device Status</p>
            <p className="text-xs text-muted-foreground">{currentDevice.message}</p>
          </div>
          <SecurityBadge status={currentDevice.status} label="" />
        </div>

        {/* Authentication Steps */}
        {step === "device" && (
          <div className="space-y-4">
            <Button 
              className="w-full h-12 text-base"
              onClick={() => setStep("pin")}
              data-testid="button-start-auth"
            >
              <Shield className="w-4 h-4 mr-2" />
              Start Secure Login
            </Button>
          </div>
        )}

        {step === "pin" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pin" className="text-base">Enter 4-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                className="text-center text-xl tracking-widest h-12 mt-2"
                maxLength={4}
                data-testid="input-pin"
              />
            </div>
            <Button 
              className="w-full h-12 text-base"
              onClick={handlePinSubmit}
              disabled={pin.length !== 4 || isLoading}
              data-testid="button-submit-pin"
            >
              {isLoading ? "Verifying..." : "Verify PIN"}
            </Button>
          </div>
        )}

        {step === "sms" && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-amber-50 rounded-md">
              <Smartphone className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-800">SMS Verification Required</p>
              <p className="text-xs text-amber-700 mt-1">
                A verification code has been sent to your registered mobile number
              </p>
            </div>
            <div>
              <Label htmlFor="sms" className="text-base">Enter SMS Code</Label>
              <Input
                id="sms"
                type="text"
                placeholder="123456"
                className="text-center text-xl tracking-widest h-12 mt-2"
                maxLength={6}
                data-testid="input-sms"
              />
            </div>
            <Button 
              className="w-full h-12 text-base"
              onClick={handleSmsVerify}
              data-testid="button-verify-sms"
            >
              Complete Verification
            </Button>
          </div>
        )}

        {/* Security Tips */}
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-xs text-blue-800 font-medium mb-1">Security Tip:</p>
          <p className="text-xs text-blue-700">
            Never share your PIN with anyone. Bank officials will never ask for your PIN.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}