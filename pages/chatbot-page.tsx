import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatbotInterface from "@/components/chatbot-interface";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{
    sender: "user" | "bot";
    content: string;
  }[]>([
    {
      sender: "bot",
      content: "👋 Hello! I'm Maya, your friendly village development assistant! I'm here to help you build amazing sustainable villages. Ask me anything about development strategies, game tips, or just say hi! 😊"
    },
    {
      sender: "bot",
      content: "You can click on the suggested questions below or type your own. I'm excited to help you make a positive impact on your virtual villages!"
    }
  ]);

  const suggestedQuestions = [
    "How do I play this game?",
    "Give me a cool tip for becoming a development champion!",
    "What's the secret to getting a high score?",
    "Hi Maya! How are you today?",
    "What happens if I focus on green energy projects?",
    "Tell me something fun about village development!"
  ];

  const handleSendMessage = async (message: string) => {
    // Add user message to state
    setMessages(prev => [...prev, { sender: "user", content: message }]);
    
    try {
      // Send to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      // Add bot response to state
      setMessages(prev => [...prev, { sender: "bot", content: data.response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <section className="py-16 bg-background flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-10 text-center animated-element">Village Development Assistant</h2>
          
          <ChatbotInterface 
            messages={messages}
            suggestedQuestions={suggestedQuestions}
            onSendMessage={handleSendMessage}
          />
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
