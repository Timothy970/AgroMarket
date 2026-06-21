import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import MobileNav from "@/components/MobileNav";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string | null;
  content: string;
  createdAt: string;
}

interface Conversation {
  otherUser: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
  lastMessage: Message;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user, token, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activePartner, setActivePartner] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [wsConnected, setWsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch active conversations list
  const { data: conversationsResponse, isLoading: conversationsLoading } = useQuery<any>({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const res = await axios.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const conversations: Conversation[] = conversationsResponse?.data || [];

  // Parse URL query search to see if we should start a new conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get("userId");
    const nameParam = params.get("name") || "Farmer";
    if (userIdParam) {
      setActivePartner({ id: userIdParam, name: nameParam });
      // Fetch messages history
      fetchHistory(userIdParam);
    }
  }, []);

  // Fetch messages history
  const fetchHistory = async (partnerId: string) => {
    try {
      const res = await axios.get(`/api/chat/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load message history:", err);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  // Select conversation
  const selectConversation = (partner: { id: string; name: string }) => {
    setActivePartner(partner);
    fetchHistory(partner.id);
  };

  // Connect WebSocket
  useEffect(() => {
    if (!token) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({ type: "auth", token }));
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          const newMsg: Message = data.message;
          // If the message belongs to active thread, append it
          if (
            activePartner &&
            (newMsg.senderId === activePartner.id || newMsg.receiverId === activePartner.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
          // Invalidate conversations list to show last message
          queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [token, activePartner, queryClient]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMsg.trim() || !activePartner || !socketRef.current || !wsConnected) return;

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        receiverId: activePartner.id,
        content: inputMsg.trim(),
      })
    );
    setInputMsg("");
  };

  const filteredConversations = conversations.filter((convo) => {
    const fullName = `${convo.otherUser.firstName || ""} ${convo.otherUser.lastName || ""}`.toLowerCase();
    const email = convo.otherUser.email.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col justify-between">
      <Header cartCount={0} showSearch={false} />

      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full grid md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
        {/* Left Side: Conversations List */}
        <Card className={`md:col-span-1 p-4 flex flex-col h-full ${activePartner ? "hidden md:flex" : "flex"}`}>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            <h2 className="font-semibold text-lg text-muted-foreground mb-2">Active Channels</h2>
            {conversationsLoading ? (
              <p className="text-sm text-muted-foreground p-2">Loading chats...</p>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No active chats found.</p>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const partnerName =
                  `${convo.otherUser.firstName || ""} ${convo.otherUser.lastName || ""}`.trim() ||
                  convo.otherUser.email;
                const isSelected = activePartner?.id === convo.otherUser.id;

                return (
                  <div
                    key={convo.otherUser.id}
                    onClick={() => selectConversation({ id: convo.otherUser.id, name: partnerName })}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/80 ${
                      isSelected ? "bg-muted shadow-sm border border-border" : ""
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {partnerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-semibold text-sm truncate">{partnerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.lastMessage.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Side: Chat Window */}
        <Card className={`md:col-span-2 flex flex-col h-full p-4 ${!activePartner ? "hidden md:flex items-center justify-center text-center bg-muted/20" : "flex"}`}>
          {activePartner ? (
            <>
              {/* Active Header */}
              <div className="flex items-center gap-3 pb-3 border-b mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setActivePartner(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {activePartner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{activePartner.name}</h3>
                  <p className="text-xs text-green-500 font-medium">
                    {wsConnected ? "● Realtime Negotiation Connected" : "○ Reconnecting..."}
                  </p>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 min-h-0">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-10">
                    No messages yet. Send a message to start negotiation.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl px-4 py-2.5 text-sm ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                              : "bg-muted text-foreground rounded-tl-none shadow-sm"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`block text-[10px] mt-1 text-right ${
                              isOwn ? "text-primary-foreground/75" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input bar */}
              <div className="flex items-center gap-2 pt-3 border-t">
                <Input
                  placeholder="Type a message or price counter..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage} disabled={!inputMsg.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4 p-8">
              <MessageSquare className="w-16 h-16 mx-auto text-primary/20 animate-bounce" />
              <h2 className="font-display font-bold text-xl">Real-time Negotiation Lounge</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Select a crop farmer from the sidebar to establish a secure negotiation channel, or start a new thread from any listing detail page.
              </p>
            </div>
          )}
        </Card>
      </main>

      <Footer />
      <MobileNav cartCount={0} />
    </div>
  );
}
