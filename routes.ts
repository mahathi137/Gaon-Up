import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  // Countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  // States by Country
  app.get("/api/countries/:countryId/states", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const states = await storage.getStatesByCountryId(countryId);
      res.json(states);
    } catch (error) {
      console.error("Error fetching states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });
  
  // Get all states (for development convenience)
  app.get("/api/states", async (req, res) => {
    try {
      // Get all countries and find India
      const countries = await storage.getCountries();
      const india = countries.find(c => c.name === "India");
      
      if (!india) {
        return res.status(404).json({ message: "India not found in countries list" });
      }
      
      // Get states for India
      const states = await storage.getStatesByCountryId(india.id);
      res.json(states);
    } catch (error) {
      console.error("Error fetching all states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  // Villages by State
  app.get("/api/states/:stateId/villages", async (req, res) => {
    try {
      const stateId = parseInt(req.params.stateId);
      const villages = await storage.getVillagesByStateId(stateId);
      res.json(villages);
    } catch (error) {
      console.error("Error fetching villages:", error);
      res.status(500).json({ message: "Failed to fetch villages" });
    }
  });

  // Village by ID
  app.get("/api/villages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const village = await storage.getVillageById(id);
      if (!village) {
        return res.status(404).json({ message: "Village not found" });
      }
      res.json(village);
    } catch (error) {
      console.error("Error fetching village:", error);
      res.status(500).json({ message: "Failed to fetch village" });
    }
  });

  // Development sectors
  app.get("/api/sectors", async (req, res) => {
    try {
      const sectors = await storage.getSectors();
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      res.status(500).json({ message: "Failed to fetch sectors" });
    }
  });

  // User scores
  app.get("/api/scores/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userScores = await storage.getUserScores(req.user.id);
      res.json(userScores);
    } catch (error) {
      console.error("Error fetching user scores:", error);
      res.status(500).json({ message: "Failed to fetch user scores" });
    }
  });

  // Leaderboard
  app.get("/api/scores", async (req, res) => {
    try {
      const scores = await storage.getAllScores();
      res.json(scores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Create score
  app.post("/api/scores", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const scoreData = {
        userId: req.user.id,
        villageId: req.body.villageId,
        developmentScore: req.body.developmentScore,
        budgetEfficiency: req.body.budgetEfficiency,
        environmentalImpact: req.body.environmentalImpact
      };
      
      const score = await storage.createScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  // Handle chat messages
  app.post("/api/chat", (req, res) => {
    // Simple chatbot implementation that would be replaced with a more sophisticated solution
    const message = req.body.message?.toLowerCase() || "";
    let response = "I'm here to help you with your village development! Ask me about game tips, sustainable development strategies, or just say hi! 😊";
    
    // Greeting responses - more direct and friendly, shorter responses
    if (message.includes('hi') || message.includes('hello') || message.includes('hey') || message.match(/^hi+$/)) {
      response = "Hi there! 👋 How can I help you today with your village development? Ask me anything!";
    } else if (message.includes('how are you') || message.includes('how you doing')) {
      response = "I'm doing great! Ready to build an amazing sustainable village together. What would you like to know?";
    } else if (message.includes('thank') || message.includes('thanks')) {
      response = "It's my responsibility and pleasure to help you! Need any other village development advice?";
    } else if (message.includes('bye') || message.includes('goodbye')) {
      response = "See you soon! I'll be here when you're ready to continue your village development journey. Your progress is saved!";
    }
    
    // Game mechanics questions
    else if (message.includes('how to play') || message.includes('game work') || message.includes('tutorial')) {
      response = "This game lets you develop villages across different sectors like agriculture, education, and healthcare. Start by selecting a village, then choose sectors to develop through fun mini-games and challenges. Each decision impacts your development score, budget efficiency, and environmental impact. The goal is to create the most sustainable and well-developed village!";
    } else if (message.includes('budget') && message.includes('water')) {
      response = "For a typical village with 1,250 residents, I recommend allocating 25-30% of your total budget for clean water access. Water is essential! You can increase efficiency by implementing rainwater harvesting systems too. Pro tip: combining water and agricultural projects can maximize your impact score!";
    } else if (message.includes('farming') || message.includes('agriculture')) {
      response = "For agriculture, consider the local climate! In semi-arid regions, drought-resistant crops like millets, pulses, and oilseeds work best. Implementing drip irrigation can save up to 60% water compared to conventional methods. Fun fact: mixing crop varieties can boost your environmental impact score by 15%!";
    } else if (message.includes('score') || message.includes('points')) {
      response = "Want to increase your development score? Focus on sustainable solutions that last 10+ years and meet multiple needs with single projects. The secret formula is: sustainability + innovation + community involvement = maximum points! Try completing sector challenges with the 'green' options for bonus environmental points.";
    } else if (message.includes('road') || message.includes('terrain')) {
      response = "Building roads? Pay attention to the terrain! Steep hills make paved roads expensive, while areas with seasonal streams need proper drainage. Did you know? Building elevated roads in flood-prone areas can earn you resilience bonus points! Consider using local materials to reduce costs by 20%.";
    } else if (message.includes('school') || message.includes('education')) {
      response = "For education projects, the ideal location for a school would be central, on slightly elevated ground away from flood zones. Pro tip: combining a school with a community center can boost your development score by 25%! Consider implementing solar panels on the roof for an environmental bonus.";
    } else if (message.includes('health') || message.includes('hospital') || message.includes('clinic')) {
      response = "Healthcare facilities should be accessible to all villagers. A central location works best, with satellite health posts in remote areas. Fun fact: every 10% improvement in healthcare access can boost your village's overall productivity by 15%! Consider telemedicine options for remote areas to maximize your impact score.";
    } else if (message.includes('energy') || message.includes('power') || message.includes('electricity')) {
      response = "For energy development, solar works great in sunny regions, while micro-hydro is perfect near streams. Did you know? A mix of renewable energy sources can increase your resilience score by 30%! Start small with solar lanterns before moving to mini-grids for the best budget efficiency.";
    }
    
    // Game features and tips
    else if (message.includes('tip') || message.includes('hint') || message.includes('advice')) {
      const tips = [
        "Balance your resource allocation carefully - going all-in on budget without sustainability will hurt your long-term score!",
        "Random events occur during implementation phase - always keep some reserve funds for emergencies!",
        "Some buildings provide passive resource generation - prioritize these early for compound benefits!",
        "Different sectors have synergy effects - developing education improves healthcare outcomes too!",
        "Villages in different states have unique challenges and advantages - explore them all!",
        "The day/night toggle on the village view lets you see different aspects of development needs.",
        "Complete all mini-games in a sector to unlock special buildings and bonuses!"
      ];
      response = "Here's a helpful tip: " + tips[Math.floor(Math.random() * tips.length)];
    } else if (message.includes('cheat') || message.includes('hack') || message.includes('shortcut')) {
      response = "There are no cheats, but here's a little secret: focusing on water infrastructure first in any village creates a multiplier effect on all your other development efforts. It's like a natural boost to everything else you build!";
    } else if (message.includes('fun') || message.includes('boring') || message.includes('entertain')) {
      response = "Want to make development more fun? Try setting creative challenges for yourself - like building a village using only green energy, or creating a perfect education-focused community. The random events and mini-games are designed to keep things exciting!";
    } else if (message.includes('difficult') || message.includes('hard') || message.includes('challenge')) {
      response = "Finding it challenging? That's part of the fun! Real development work is complex too. Try focusing on one sector at a time, and remember that small, consistent improvements add up to big results over time. You can always revisit your decisions and try different approaches!";
    }
    
    // Send the response with appropriate delay to feel more natural
    setTimeout(() => {
      res.json({ response });
    }, 500);
  });

  // Save feedback
  app.post("/api/feedback", async (req, res) => {
    // Just return success for now as we don't have a feedback table
    res.status(201).json({ message: "Feedback received, thank you!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
