import { Link } from "wouter";
import logoImage from "../assets/logo.jpg";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src={logoImage} 
                alt="GaonUp Logo" 
                className="h-8 w-8 mr-2 rounded-full" 
              />
              <h3 className="text-xl font-bold">GaonUp</h3>
            </div>
            <p className="text-neutral text-sm">An interactive village development simulation game focusing on sustainable rural development in India.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/village" className="hover:text-accent transition duration-300">
                  Village Selection
                </Link>
              </li>
              <li>
                <Link href="/sectors" className="hover:text-accent transition duration-300">
                  Development Sectors
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-accent transition duration-300">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-accent transition duration-300">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Helpline</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <i className="fa-solid fa-phone-alt mr-2"></i>
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-envelope mr-2"></i>
                <span>support@goanup.org</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-headset mr-2"></i>
                <span>24/7 Chat Support</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-accent transition duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-accent transition duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-accent transition duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-accent transition duration-300">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
            <p className="text-sm text-neutral">Subscribe to our newsletter for updates</p>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 pt-6 text-center text-sm text-neutral">
          <p>&copy; {new Date().getFullYear()} GaonUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
