import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-24 md:pb-20 village-pattern bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animated-element">Build Your Village</h1>
            <p className="text-lg md:text-xl text-neutral mb-8 animated-element">Create sustainable development solutions for rural India in this interactive village planning game</p>
            <Link href="/village">
              <Button className="bg-accent hover:bg-accent/90 text-white font-medium py-3 px-8 rounded-md text-lg transition duration-300 animated-element ripple">
                Start Building
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-10 text-center animated-element">Develop Sustainable Villages</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animated-element">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-map-location-dot text-xl text-primary"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Choose Villages</h3>
              <p className="text-muted-foreground">Select from various Indian villages, each with unique challenges and development opportunities.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-lightbulb text-xl text-accent"></i>
              </div>
              <h3 className="text-xl font-bold text-accent mb-2">Plan Projects</h3>
              <p className="text-muted-foreground">Design and implement projects across multiple development sectors like agriculture, health, and education.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-trophy text-xl text-secondary"></i>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Earn Points</h3>
              <p className="text-muted-foreground">Get scores based on sustainability, budget efficiency, and environmental impact of your development choices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 animated-element">Ready to Make a Difference?</h2>
          <p className="max-w-2xl mx-auto mb-8 animated-element">Join thousands of other players in creating sustainable solutions for rural India!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animated-element">
            <Link href="/village">
              <Button className="bg-white text-primary hover:bg-neutral">
                Choose a Village
              </Button>
            </Link>
            <Link href="/sectors">
              <Button className="bg-accent hover:bg-accent/90">
                Explore Sectors
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button className="bg-secondary hover:bg-secondary/90">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}