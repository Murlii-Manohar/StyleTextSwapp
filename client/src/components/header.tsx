import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AlignJustify, LogOut, Timer } from "lucide-react";
import { SheetTrigger, Sheet, SheetContent } from "@/components/ui/sheet";

export default function Header() {
  const { user, guestSession, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-primary mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.5 3L17 7.5L12.5 12L8 7.5L12.5 3z" />
            <path d="M5 13L9.5 8.5L14 13L9.5 17.5L5 13z" />
            <path d="M20 13L15.5 17.5L11 13L15.5 8.5L20 13z" />
            <path d="M8 19L12.5 14.5L17 19L12.5 23.5L8 19z" />
          </svg>
          <Link href="/">
            <h1 className="text-xl font-bold text-neutral-800 cursor-pointer">TextStyler</h1>
          </Link>
        </div>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {!user && guestSession && (
            <div className="flex items-center mr-2 text-sm text-neutral-700">
              <Timer className="h-4 w-4 mr-1" />
              <span>
                Remaining: <span className="font-medium">{guestSession.remainingUses}</span>/
                {guestSession.maxUsage}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-700">
                Welcome, <span className="font-medium">{user.username}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Log Out"}
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <AlignJustify className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                {!user && guestSession && (
                  <div className="flex items-center text-sm text-neutral-700 mb-2">
                    <Timer className="h-4 w-4 mr-1" />
                    <span>
                      Remaining: <span className="font-medium">{guestSession.remainingUses}</span>/
                      {guestSession.maxUsage}
                    </span>
                  </div>
                )}

                {user ? (
                  <>
                    <div className="text-sm text-neutral-700">
                      Logged in as <span className="font-medium">{user.username}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="outline" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
