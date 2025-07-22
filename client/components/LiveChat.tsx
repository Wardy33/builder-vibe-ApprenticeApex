import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotResponse {
  response: string;
  shouldContactSupport?: boolean;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help you with any questions about ApprenticeApex. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<ChatBotResponse> => {
    const message = userMessage.toLowerCase();
    
    // Keywords for different topics
    const pricingKeywords = ['price', 'cost', 'plan', 'subscription', 'fee', 'trial', 'money', 'payment'];
    const howItWorksKeywords = ['how', 'work', 'process', 'start', 'begin', 'use'];
    const apprenticeshipKeywords = ['apprentice', 'apprenticeship', 'training', 'placement', 'hire', 'recruit'];
    const supportKeywords = ['support', 'help', 'problem', 'issue', 'contact', 'speak', 'talk', 'human', 'agent'];
    const companyKeywords = ['company', 'about', 'who', 'team', 'business'];
    
    if (supportKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'I understand you\'d like to speak with our support team. For personalized assistance, please email us at hello@apprenticeapex.co.uk and we\'ll get back to you within 2 hours.',
        shouldContactSupport: true
      };
    }
    
    if (pricingKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'Great question about pricing! We offer a 60-day risk-free trial where you only pay £399 per successful hire. After that, we have plans starting from £49/month + 12% success fee. Would you like me to direct you to our detailed pricing page?'
      };
    }
    
    if (howItWorksKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'ApprenticeApex connects you with Gen Z talent through our AI-powered matching system. Simply post your apprenticeship, review matched candidates, and hire through our platform. We handle the entire process from sourcing to placement!'
      };
    }
    
    if (apprenticeshipKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'We specialize in apprenticeship placements across various industries including technology, marketing, retail, and more. Our platform helps you find motivated Gen Z candidates ready to start their careers. What type of apprentice are you looking for?'
      };
    }
    
    if (companyKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'ApprenticeApex was founded in 2025 to revolutionize apprenticeship recruitment. We use AI to match employers with talented Gen Z candidates, making the hiring process faster and more effective. We\'re based in the UK and focus on connecting the next generation with amazing career opportunities!'
      };
    }
    
    // Default responses
    const defaultResponses = [
      'That\'s a great question! I can help with information about our pricing, how the platform works, or apprenticeship placements. What would you like to know more about?',
      'I\'m here to help! Feel free to ask about our services, pricing, or how to get started with ApprenticeApex.',
      'Thanks for your question! I can provide information about apprenticeship recruitment, our platform features, or pricing. What interests you most?'
    ];
    
    return {
      response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const botResponse = await generateBotResponse(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // If bot suggests contacting support, add a follow-up message
      if (botResponse.shouldContactSupport) {
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: 'Would you like me to open your email client to send a message to our support team?',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, followUpMessage]);
        }, 1000);
      }
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request from ApprenticeApex Website');
    const body = encodeURIComponent('Hello,\n\nI need assistance with:\n\n[Please describe your question or issue here]\n\nThank you!');
    window.open(`mailto:hello@apprenticeapex.co.uk?subject=${subject}&body=${body}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        title="Open live chat"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-black">ApprenticeApex Support</h3>
            <p className="text-white/80 text-sm">Online • Usually replies instantly ✨</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                message.sender === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-lg p-3 shadow-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white/80' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleContactSupport}
          className="w-full mt-2 text-purple-500 hover:text-purple-600 text-sm transition-colors"
        >
          💌 Email our support team
        </button>
      </div>
    </div>
  );
}
