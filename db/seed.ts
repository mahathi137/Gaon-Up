import { db } from "./index";
import { countries, states, villages, sectors, users, scores } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Drop all tables and recreate them - force reseed
    console.log("Force dropping and recreating tables...");
    
    // Delete any existing data
    try {
      await db.delete(scores);
      await db.delete(villages);
      await db.delete(states);
      await db.delete(countries);
      await db.delete(sectors);
      await db.delete(users);
    } catch (error) {
      console.log("Tables might not exist yet, continuing with seed...");
    }

    // Seed countries
    const countriesData = [
      { name: "India", code: "IN" },
      { name: "Nepal", code: "NP" },
      { name: "Bangladesh", code: "BD" },
      { name: "Bhutan", code: "BT" },
      { name: "Sri Lanka", code: "LK" },
      { name: "Myanmar", code: "MM" },
      { name: "Afghanistan", code: "AF" },
      { name: "Pakistan", code: "PK" },
      { name: "Maldives", code: "MV" },
      { name: "China", code: "CN" }
    ];
    
    const insertedCountries = await db.insert(countries).values(countriesData).returning();
    console.log(`Inserted ${insertedCountries.length} countries`);
    
    // Get India's ID for state references
    const india = insertedCountries.find(c => c.name === "India");
    if (!india) throw new Error("Failed to find India in inserted countries");
    
    // Seed states for India - exactly the 5 requested states
    const statesData = [
      { name: "Tamil Nadu", countryId: india.id },
      { name: "Telangana", countryId: india.id },
      { name: "Rajasthan", countryId: india.id },
      { name: "Andhra Pradesh", countryId: india.id },
      { name: "Kerala", countryId: india.id }
    ];
    
    const insertedStates = await db.insert(states).values(statesData).returning();
    console.log(`Inserted ${insertedStates.length} states`);
    
    // Get state IDs for village references
    const telangana = insertedStates.find(s => s.name === "Telangana");
    const tamilNadu = insertedStates.find(s => s.name === "Tamil Nadu");
    const andhraP = insertedStates.find(s => s.name === "Andhra Pradesh");
    const rajasthan = insertedStates.find(s => s.name === "Rajasthan");
    const kerala = insertedStates.find(s => s.name === "Kerala");
    
    if (!telangana) throw new Error("Failed to find Telangana in inserted states");
    if (!tamilNadu) throw new Error("Failed to find Tamil Nadu in inserted states");
    if (!andhraP) throw new Error("Failed to find Andhra Pradesh in inserted states");
    if (!rajasthan) throw new Error("Failed to find Rajasthan in inserted states");
    if (!kerala) throw new Error("Failed to find Kerala in inserted states");
    
    // Seed villages - 10 villages for each state
    const villagesData = [
      // Telangana Villages - 10 villages
      { 
        name: "Satvadi", 
        stateId: telangana.id, 
        population: 1250, 
        waterBodies: 35, 
        greenCover: 60, 
        development: 45,
        description: "A traditional farming village with water scarcity challenges"
      },
      { 
        name: "Ramannapeta", 
        stateId: telangana.id, 
        population: 980, 
        waterBodies: 40, 
        greenCover: 55, 
        development: 50,
        description: "A village with rich cultural heritage and agricultural practice"
      },
      { 
        name: "Chintalapalem", 
        stateId: telangana.id, 
        population: 1120, 
        waterBodies: 30, 
        greenCover: 45, 
        development: 40,
        description: "A village focused on handicrafts and cottage industries"
      },
      { 
        name: "Warangal", 
        stateId: telangana.id, 
        population: 1560, 
        waterBodies: 45, 
        greenCover: 50, 
        development: 55,
        description: "Historic village known for temples and cultural heritage"
      },
      { 
        name: "Nizamabad", 
        stateId: telangana.id, 
        population: 1850, 
        waterBodies: 38, 
        greenCover: 42, 
        development: 48,
        description: "Agricultural village with focus on sustainable farming"
      },
      { 
        name: "Karimnagar", 
        stateId: telangana.id, 
        population: 1320, 
        waterBodies: 42, 
        greenCover: 58, 
        development: 52,
        description: "Village known for silver filigree work and cottage industries"
      },
      { 
        name: "Medak", 
        stateId: telangana.id, 
        population: 990, 
        waterBodies: 36, 
        greenCover: 62, 
        development: 46,
        description: "Religious heritage village with diverse farming practices"
      },
      { 
        name: "Siddipet", 
        stateId: telangana.id, 
        population: 1180, 
        waterBodies: 33, 
        greenCover: 49, 
        development: 42,
        description: "Progressive village with focus on education and development"
      },
      { 
        name: "Nalgonda", 
        stateId: telangana.id, 
        population: 1420, 
        waterBodies: 39, 
        greenCover: 53, 
        development: 47,
        description: "Village working to overcome fluoride water contamination issues"
      },
      { 
        name: "Khammam", 
        stateId: telangana.id, 
        population: 1640, 
        waterBodies: 43, 
        greenCover: 64, 
        development: 51,
        description: "Forest-adjacent village with tribal heritage and culture"
      },
      
      // Tamil Nadu Villages - 10 villages
      { 
        name: "Thirupalaikudi", 
        stateId: tamilNadu.id, 
        population: 2450, 
        waterBodies: 55, 
        greenCover: 70, 
        development: 60,
        description: "A coastal village known for fishing and traditional boat-making"
      },
      { 
        name: "Kovilpatti", 
        stateId: tamilNadu.id, 
        population: 1780, 
        waterBodies: 25, 
        greenCover: 40, 
        development: 55,
        description: "Famous for match factories and traditional sweets"
      },
      { 
        name: "Mahabalipuram", 
        stateId: tamilNadu.id, 
        population: 1580, 
        waterBodies: 65, 
        greenCover: 45, 
        development: 75,
        description: "UNESCO heritage site with ancient temples and stone carvings"
      },
      { 
        name: "Chettinad", 
        stateId: tamilNadu.id, 
        population: 1890, 
        waterBodies: 35, 
        greenCover: 38, 
        development: 68,
        description: "Known for palatial houses and unique cuisine"
      },
      { 
        name: "Pollachi", 
        stateId: tamilNadu.id, 
        population: 2150, 
        waterBodies: 58, 
        greenCover: 72, 
        development: 62,
        description: "Agricultural hub with coconut farms and film shooting locations"
      },
      { 
        name: "Valparai", 
        stateId: tamilNadu.id, 
        population: 1250, 
        waterBodies: 70, 
        greenCover: 85, 
        development: 50,
        description: "Tea plantation village in the Western Ghats with unique ecosystem"
      },
      { 
        name: "Tharangambadi", 
        stateId: tamilNadu.id, 
        population: 1680, 
        waterBodies: 60, 
        greenCover: 42, 
        development: 58,
        description: "Former Danish colony with coastal heritage and fishing tradition"
      },
      { 
        name: "Kanadukathan", 
        stateId: tamilNadu.id, 
        population: 1350, 
        waterBodies: 40, 
        greenCover: 36, 
        development: 65,
        description: "Heritage village with mansion architecture and crafts"
      },
      { 
        name: "Courtallam", 
        stateId: tamilNadu.id, 
        population: 1480, 
        waterBodies: 78, 
        greenCover: 68, 
        development: 54,
        description: "Known as the 'Spa of South India' for its therapeutic waterfalls"
      },
      { 
        name: "Pichavaram", 
        stateId: tamilNadu.id, 
        population: 1290, 
        waterBodies: 92, 
        greenCover: 74, 
        development: 48,
        description: "Home to one of the world's largest mangrove forests"
      },
      
      // Andhra Pradesh Villages - 10 villages
      { 
        name: "Araku Valley", 
        stateId: andhraP.id, 
        population: 1920, 
        waterBodies: 60, 
        greenCover: 80, 
        development: 50,
        description: "Known for coffee plantations in hilly terrain"
      },
      { 
        name: "Lepakshi", 
        stateId: andhraP.id, 
        population: 850, 
        waterBodies: 30, 
        greenCover: 45, 
        development: 40,
        description: "Historic village with famous temples and art heritage"
      },
      { 
        name: "Anantapur", 
        stateId: andhraP.id, 
        population: 2150, 
        waterBodies: 20, 
        greenCover: 30, 
        development: 45,
        description: "Located in a drought-prone region with innovative water harvesting"
      },
      { 
        name: "Etikoppaka", 
        stateId: andhraP.id, 
        population: 1280, 
        waterBodies: 50, 
        greenCover: 55, 
        development: 47,
        description: "Famous for lacquer toy making and wooden crafts"
      },
      { 
        name: "Puttaparthi", 
        stateId: andhraP.id, 
        population: 1780, 
        waterBodies: 35, 
        greenCover: 42, 
        development: 60,
        description: "Spiritual center known for ashrams and education facilities"
      },
      { 
        name: "Srikalahasti", 
        stateId: andhraP.id, 
        population: 1560, 
        waterBodies: 40, 
        greenCover: 48, 
        development: 52,
        description: "Temple town famous for Kalamkari art and craftsmanship"
      },
      { 
        name: "Tadipatri", 
        stateId: andhraP.id, 
        population: 1950, 
        waterBodies: 25, 
        greenCover: 32, 
        development: 45,
        description: "Known for limestone quarries and ancient temple architecture"
      },
      { 
        name: "Rajahmundry", 
        stateId: andhraP.id, 
        population: 2250, 
        waterBodies: 65, 
        greenCover: 50, 
        development: 58,
        description: "Located on the banks of Godavari with rich cultural heritage"
      },
      { 
        name: "Horsley Hills", 
        stateId: andhraP.id, 
        population: 780, 
        waterBodies: 45, 
        greenCover: 75, 
        development: 42,
        description: "Hill station village with unique microclimate and biodiversity"
      },
      { 
        name: "Konaseema", 
        stateId: andhraP.id, 
        population: 1450, 
        waterBodies: 95, 
        greenCover: 82, 
        development: 46,
        description: "Delta village known as 'God's own creation' with coconut groves"
      },
      
      // Rajasthan Villages - 10 villages
      { 
        name: "Jaisalmer", 
        stateId: rajasthan.id, 
        population: 1650, 
        waterBodies: 15, 
        greenCover: 20, 
        development: 65,
        description: "Desert village known for its magnificent fort and golden sandstone architecture"
      },
      { 
        name: "Pushkar", 
        stateId: rajasthan.id, 
        population: 1480, 
        waterBodies: 45, 
        greenCover: 25, 
        development: 70,
        description: "Sacred village with a holy lake and annual camel fair"
      },
      { 
        name: "Ranakpur", 
        stateId: rajasthan.id, 
        population: 850, 
        waterBodies: 30, 
        greenCover: 55, 
        development: 45,
        description: "Home to one of the most spectacular Jain temples"
      },
      { 
        name: "Bundi", 
        stateId: rajasthan.id, 
        population: 1250, 
        waterBodies: 35, 
        greenCover: 40, 
        development: 48,
        description: "Known for step wells and miniature paintings with blue houses"
      },
      { 
        name: "Barmer", 
        stateId: rajasthan.id, 
        population: 1590, 
        waterBodies: 10, 
        greenCover: 15, 
        development: 42,
        description: "Desert village famous for wood carvings and traditional textiles"
      },
      { 
        name: "Kumbhalgarh", 
        stateId: rajasthan.id, 
        population: 780, 
        waterBodies: 25, 
        greenCover: 45, 
        development: 52,
        description: "Home to the second-longest wall in the world after the Great Wall of China"
      },
      { 
        name: "Mandawa", 
        stateId: rajasthan.id, 
        population: 1080, 
        waterBodies: 20, 
        greenCover: 30, 
        development: 58,
        description: "Famous for its intricately painted havelis in the Shekhawati region"
      },
      { 
        name: "Abhaneri", 
        stateId: rajasthan.id, 
        population: 950, 
        waterBodies: 40, 
        greenCover: 35, 
        development: 42,
        description: "Known for Chand Baori, one of India's deepest and most beautiful step wells"
      },
      { 
        name: "Khimsar", 
        stateId: rajasthan.id, 
        population: 1150, 
        waterBodies: 15, 
        greenCover: 20, 
        development: 50,
        description: "Desert village with sand dunes and a historic fort-palace"
      },
      { 
        name: "Narlai", 
        stateId: rajasthan.id, 
        population: 820, 
        waterBodies: 30, 
        greenCover: 45, 
        development: 55,
        description: "Charming rural settlement nestled amidst rocky outcrops and traditional architecture"
      },
      
      // Kerala Villages - 10 villages
      { 
        name: "Kumarakom", 
        stateId: kerala.id, 
        population: 1850, 
        waterBodies: 95, 
        greenCover: 85, 
        development: 75,
        description: "Backwater village famous for bird sanctuary and houseboat tourism"
      },
      { 
        name: "Thekkady", 
        stateId: kerala.id, 
        population: 1650, 
        waterBodies: 80, 
        greenCover: 90, 
        development: 65,
        description: "Gateway to Periyar Wildlife Sanctuary with spice plantations"
      },
      { 
        name: "Mararikulam", 
        stateId: kerala.id, 
        population: 1450, 
        waterBodies: 90, 
        greenCover: 75, 
        development: 70,
        description: "Fishing village known for pristine beaches and traditional lifestyle"
      },
      { 
        name: "Kuttanad", 
        stateId: kerala.id, 
        population: 1850, 
        waterBodies: 98, 
        greenCover: 80, 
        development: 65,
        description: "Unique below-sea-level farming system with extensive waterways"
      },
      { 
        name: "Wayanad", 
        stateId: kerala.id, 
        population: 1550, 
        waterBodies: 75, 
        greenCover: 95, 
        development: 60,
        description: "Hill station village with tribal communities and coffee plantations"
      },
      { 
        name: "Kovalam", 
        stateId: kerala.id, 
        population: 1650, 
        waterBodies: 85, 
        greenCover: 70, 
        development: 72,
        description: "Coastal village with crescent-shaped beaches and Ayurvedic traditions"
      },
      { 
        name: "Kumily", 
        stateId: kerala.id, 
        population: 1250, 
        waterBodies: 70, 
        greenCover: 88, 
        development: 58,
        description: "Spice village at the border of Kerala and Tamil Nadu with cardamom hills"
      },
      { 
        name: "Athirappilly", 
        stateId: kerala.id, 
        population: 950, 
        waterBodies: 88, 
        greenCover: 92, 
        development: 62,
        description: "Home to Kerala's largest waterfall and pristine rainforest"
      },
      { 
        name: "Munroe Island", 
        stateId: kerala.id, 
        population: 850, 
        waterBodies: 95, 
        greenCover: 85, 
        development: 55,
        description: "Cluster of islands at the confluence of Ashtamudi Lake and Kallada River"
      },
      { 
        name: "Bekal", 
        stateId: kerala.id, 
        population: 1450, 
        waterBodies: 82, 
        greenCover: 78, 
        development: 68,
        description: "Coastal village with historic fort and golden beaches"
      }
    ];
    
    const insertedVillages = await db.insert(villages).values(villagesData).returning();
    console.log(`Inserted ${insertedVillages.length} villages`);
    
    // Seed development sectors
    const sectorsData = [
      { 
        name: "Agriculture", 
        description: "Develop sustainable farming practices, irrigation systems, and crop management solutions.", 
        budget: "250000", 
        color: "#556B2F",
        icon: "fa-wheat-awn",
        imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      { 
        name: "Health", 
        description: "Build medical facilities, promote preventive healthcare, and ensure access to essential services.", 
        budget: "320000", 
        color: "#A52A2A",
        icon: "fa-heart-pulse",
        imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      { 
        name: "Rural Roads", 
        description: "Create connectivity solutions including paved roads, bridges, and eco-friendly transportation options.", 
        budget: "500000", 
        color: "#8B4513",
        icon: "fa-road",
        imageUrl: "https://images.unsplash.com/photo-1518623001395-125242310d0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      { 
        name: "Water Supply", 
        description: "Implement clean water solutions, rainwater harvesting, and sustainable management systems.", 
        budget: "280000", 
        color: "#007BA7",
        icon: "fa-droplet",
        imageUrl: "https://images.unsplash.com/photo-1543057227-059c154a64cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      { 
        name: "Education", 
        description: "Build schools, develop teaching resources, and create educational programs for all age groups.", 
        budget: "350000", 
        color: "#CD853F",
        icon: "fa-school",
        imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      { 
        name: "Sanitation", 
        description: "Develop waste management systems, toilet facilities, and hygiene improvement programs.", 
        budget: "200000", 
        color: "#A0522D",
        icon: "fa-toilet",
        imageUrl: "https://images.unsplash.com/photo-1623771702315-e8af135a1a1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      }
    ];
    
    const insertedSectors = await db.insert(sectors).values(sectorsData).returning();
    console.log(`Inserted ${insertedSectors.length} sectors`);
    
    // Create demo users
    const usersData = [
      { username: "rahul", password: await hashPassword("password123"), age: 28, gender: "male" },
      { username: "priya", password: await hashPassword("password123"), age: 25, gender: "female" },
      { username: "amit", password: await hashPassword("password123"), age: 30, gender: "male" },
      { username: "meera", password: await hashPassword("password123"), age: 22, gender: "female" },
      { username: "ravi", password: await hashPassword("password123"), age: 35, gender: "male" }
    ];
    
    const insertedUsers = await db.insert(users).values(usersData).returning();
    console.log(`Inserted ${insertedUsers.length} users`);
    
    // Create demo scores
    const scoresData = [];
    
    for (let i = 0; i < insertedUsers.length; i++) {
      scoresData.push({
        userId: insertedUsers[i].id,
        villageId: insertedVillages[i].id,
        developmentScore: 92 - i * 4, // Descending scores for leaderboard
        budgetEfficiency: 95 - i * 3,
        environmentalImpact: i < 3 ? "Positive" : "Neutral"
      });
    }
    
    const insertedScores = await db.insert(scores).values(scoresData).returning();
    console.log(`Inserted ${insertedScores.length} score records`);
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
