import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import logoImage from "../assets/logo.jpg";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  const [location] = useLocation();

  // Close mobile menu when changing location
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/village", label: "Village" },
    { href: "/sectors", label: "Sectors" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/chatbot", label: "AI Assistant" },
    { href: "/feedback", label: "Feedback" }
  ];

  return (
    <nav className="bg-primary text-white shadow-md fixed w-full z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src={logoImage} 
                alt="GaonUp Logo" 
                className="h-10 mr-2 rounded-full"
              />
              <h1 className="text-2xl font-bold tracking-wider cursor-pointer">GaonUp</h1>
            </Link>
          </div>
          
          {!isMobile && (
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`hover:text-accent transition duration-300 ${location === link.href ? 'text-accent' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          
          {isMobile && (
            <div>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="focus:outline-none"
              >
                <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
              </button>
            </div>
          )}
          
          {!isMobile && (
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-primary"
                >
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-primary border-t border-white border-opacity-20">
          <div className="container mx-auto px-4 py-2 space-y-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block py-2 hover:text-accent transition duration-300 ${location === link.href ? 'text-accent' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white border-opacity-20 flex justify-between items-center">
              <Link href="/auth" className="block w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-primary w-full"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
