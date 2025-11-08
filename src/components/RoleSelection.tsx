import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "customer" | "business";

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: UserRole | null;
}

export const RoleSelection = ({ onRoleSelect, selectedRole }: RoleSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">Choose Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Select how you'll use SelfHub AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all border-2 h-full",
            selectedRole === "customer"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onRoleSelect("customer")}
        >
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  selectedRole === "customer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-base leading-tight">I'm a Customer</h4>
                  {selectedRole === "customer" && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  I want to book beauty and wellness services
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">Browse and book services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">Manage your appointments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">Leave reviews and ratings</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Owner Option */}
        <Card
          className={cn(
            "cursor-pointer transition-all border-2 h-full",
            selectedRole === "business"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onRoleSelect("business")}
        >
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  selectedRole === "business"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-base leading-tight">I'm a Business Owner</h4>
                  {selectedRole === "business" && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  I want to offer services and manage bookings
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground flex-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">List your business and services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">Manage appointments and calendar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">Track analytics and grow your business</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

