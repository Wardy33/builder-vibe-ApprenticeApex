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

    // Enhanced keyword categories with more comprehensive coverage
    const pricingKeywords = ['price', 'cost', 'plan', 'subscription', 'fee', 'trial', 'money', 'payment', 'charge', 'rate', 'budget', 'affordable'];
    const howItWorksKeywords = ['how', 'work', 'process', 'start', 'begin', 'use', 'step', 'guide', 'tutorial', 'onboard'];
    const apprenticeshipKeywords = ['apprentice', 'apprenticeship', 'training', 'placement', 'hire', 'recruit', 'candidate', 'talent', 'skill'];
    const supportKeywords = ['support', 'help', 'problem', 'issue', 'contact', 'speak', 'talk', 'human', 'agent', 'assist'];
    const companyKeywords = ['company', 'about', 'who', 'team', 'business', 'founded', 'mission'];
    const benefitsKeywords = ['benefit', 'advantage', 'why', 'better', 'unique', 'different', 'value'];
    const integrationKeywords = ['integrate', 'api', 'connect', 'sync', 'import', 'export'];
    const greetingKeywords = ['hello', 'hi', 'hey', 'good', 'morning', 'afternoon', 'evening'];
    
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

    if (greetingKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'Hello! Welcome to ApprenticeApex. I\'m here to help you discover how we can connect you with top talent through our apprenticeship platform. What would you like to know?'
      };
    }

    if (benefitsKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'Great question! ApprenticeApex offers AI-powered matching, 90% placement success rate, £20,000+ average starting salaries, and zero cost to students. We save you time and connect you with pre-vetted, motivated candidates!'
      };
    }

    if (integrationKeywords.some(keyword => message.includes(keyword))) {
      return {
        response: 'We offer seamless integrations with major HR systems and can provide API access for enterprise clients. Our platform is designed to fit into your existing workflow. Would you like to speak with our technical team?',
        shouldContactSupport: true
      };
    }

    // Default responses
    const defaultResponses = [
      'That\'s a great question! I can help with information about our pricing, how the platform works, or apprenticeship placements. What would you like to know more about?',
      'I\'m here to help! Feel free to ask about our services, pricing, or how to get started with ApprenticeApex.',
      'Thanks for your question! I can provide information about apprenticeship recruitment, our platform features, or pricing. What interests you most?',
      'I\'d be happy to help you learn more about ApprenticeApex. You can ask me about costs, how our matching works, or benefits for companies!'
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
        id="live-chat-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 sm:bottom-20 right-6 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 z-50 border border-white/20"
        title="Open live chat"
        aria-label="Open live chat"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 sm:bottom-20 right-4 bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 p-1 rounded-2xl shadow-2xl w-80 sm:w-96 h-96 sm:h-[500px] flex flex-col z-50">
      <div className="bg-black/90 backdrop-blur-sm rounded-2xl h-full flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg drop-shadow-lg">AI Assistant</h3>
              <p className="text-white/90 text-sm font-medium">Online • Super fast replies</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-all duration-200 hover:rotate-90 p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/50 to-black/80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg ${
                message.sender === 'user' ? 'bg-gradient-to-br from-orange-400 to-pink-500 border-orange-300' : 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-300'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`rounded-xl p-3 shadow-xl border ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 text-white border-orange-300/50'
                  : 'bg-gradient-to-br from-cyan-50 to-blue-100 text-gray-900 border-cyan-300/50'
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
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-cyan-300 shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-300/50 rounded-xl p-3 shadow-xl">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/20 p-4 bg-gradient-to-r from-black/80 to-black/60 rounded-b-2xl">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-white/30 rounded-xl px-4 py-3 text-sm bg-white/90 backdrop-blur-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 focus:bg-white placeholder-gray-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-12 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
          <button
            onClick={handleContactSupport}
            className="w-full mt-3 text-transparent bg-gradient-to-r from-cyan-400 via-orange-400 to-pink-500 bg-clip-text hover:from-cyan-500 hover:to-pink-600 text-sm transition-all duration-200 font-bold text-center"
          >
            Email our support team
          </button>
        </div>
      </div>
    </div>
  );
}
