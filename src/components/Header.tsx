import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "./AuthDialog";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <h2 
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
              onClick={() => {
                if (user && profile?.is_business_owner) {
                  navigate("/business/dashboard");
                } else if (user) {
                  navigate("/customer/home");
                } else {
                  navigate("/");
                }
              }}
            >
              SelfHub AI
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {loading ? (
              <div className="h-8 w-8 animate-pulse bg-muted rounded" />
            ) : user ? (
              <>
                {profile?.is_business_owner ? (
                  <Button 
                    size="sm" 
                    className="hidden sm:flex text-xs sm:text-sm"
                    onClick={() => navigate("/business/dashboard")}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="hidden sm:flex text-xs sm:text-sm"
                    onClick={() => navigate("/customer/bookings")}
                  >
                    My Bookings
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 min-w-[40px] sm:min-w-auto">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-xs sm:text-sm">
                        {profile?.full_name || user.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground break-all">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {profile?.is_business_owner ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/business/dashboard")}>
                          <Settings className="mr-2 h-4 w-4" />
                          Business Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/business/calendar")}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Calendar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/customer/home")}>
                          <User className="mr-2 h-4 w-4" />
                          Browse Services
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/customer/home")}>
                          <User className="mr-2 h-4 w-4" />
                          Browse Services
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/customer/bookings")}>
                          <Calendar className="mr-2 h-4 w-4" />
                          My Bookings
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Log In / Sign Up</span>
                </Button>
                <Button 
                  size="sm" 
                  className="hidden sm:flex text-xs sm:text-sm"
                  onClick={() => navigate("/for-businesses")}
                >
                  List your business
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};

export default Header;
