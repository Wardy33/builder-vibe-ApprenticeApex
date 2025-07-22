import { ReactNode } from "react";
import { WebHeader } from "./WebHeader";
import { WebFooter } from "./WebFooter";
import LiveChat from "./LiveChat";

interface WebLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function WebLayout({ 
  children, 
  className = "", 
  showHeader = true, 
  showFooter = true 
}: WebLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {showHeader && <WebHeader />}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      {showFooter && <WebFooter />}
      <LiveChat />
    </div>
  );
}
