import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "customer" | "business";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole | null;
}

export const RoleSelection = ({ onRoleSelect, selectedRole }: RoleSelectionProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold">Choose Your Role</h2>
        <p className="text-muted-foreground">
          Select how you'll use SelfHub AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
            selectedRole === "customer" && "border-primary ring-2 ring-primary"
          )}
          onClick={() => onRoleSelect("customer")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-3 rounded-lg",
                selectedRole === "customer" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <User className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">I'm a Customer</CardTitle>
            </div>
            <CardDescription>
              I want to book beauty and wellness services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Browse and book services</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Manage your appointments</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Leave reviews and ratings</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Business Owner Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
            selectedRole === "business" && "border-primary ring-2 ring-primary"
          )}
          onClick={() => onRoleSelect("business")}
        >
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-3 rounded-lg",
                selectedRole === "business" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">I'm a Business Owner</CardTitle>
            </div>
            <CardDescription>
              I want to offer services and manage bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>List your business and services</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Manage appointments and calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Track analytics and grow your business</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {selectedRole && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Selected: <span className="font-medium capitalize">{selectedRole}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            You can switch roles later if needed
          </p>
        </div>
      )}
    </div>
  );
};

