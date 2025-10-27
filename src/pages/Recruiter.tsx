import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Briefcase, Users } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Recruiter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecruiterRole, setHasRecruiterRole] = useState<boolean | null>(null);
  const [portfolioCount, setPortfolioCount] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isRecruiter = roles?.some(r => r.role === 'recruiter');
      setHasRecruiterRole(isRecruiter);

      if (!isRecruiter) {
        toast.error("Access denied. Recruiter role required.");
        navigate("/dashboard");
      }
    };

    checkRole();
  }, [user, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('recruiter-chat', {
        body: { 
          message: input,
          conversationHistory: messages 
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.portfolioCount !== undefined) {
        setPortfolioCount(data.portfolioCount);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to get response");
      
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (hasRecruiterRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasRecruiterRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold">Recruiter Assistant</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {portfolioCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {portfolioCount} Portfolios Indexed
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-16rem)] flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Briefcase className="w-16 h-16 text-muted-foreground" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">AI Portfolio Matcher</h2>
                  <p className="text-muted-foreground max-w-md">
                    Describe the role you're recruiting for, and I'll analyze all public portfolios to find the best matches.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 max-w-2xl">
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto p-4"
                    onClick={() => setInput("Looking for a senior React developer with 5+ years experience")}
                  >
                    <div>
                      <div className="font-medium">Senior Developer</div>
                      <div className="text-xs text-muted-foreground">React, 5+ years</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto p-4"
                    onClick={() => setInput("Need a full-stack developer with TypeScript and PostgreSQL experience")}
                  >
                    <div>
                      <div className="font-medium">Full-Stack Developer</div>
                      <div className="text-xs text-muted-foreground">TypeScript, PostgreSQL</div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the role or ask about specific candidates..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Recruiter;