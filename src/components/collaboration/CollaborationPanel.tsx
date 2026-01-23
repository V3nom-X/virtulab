import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Send, 
  Copy, 
  UserPlus,
  X,
  Loader2,
  Video,
  Mic,
  MicOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  user_id: string;
  cursor_x: number;
  cursor_y: number;
  profile?: {
    username: string | null;
    avatar_url: string | null;
  };
  color: string;
}

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface CollaborationPanelProps {
  roomId: string;
  experimentId?: string;
  onCursorMove?: (x: number, y: number) => void;
  onClose?: () => void;
  className?: string;
}

const CURSOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

export function CollaborationPanel({
  roomId,
  experimentId,
  onCursorMove,
  onClose,
  className
}: CollaborationPanelProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get user's assigned color
  const getUserColor = useCallback((userId: string): string => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CURSOR_COLORS[hash % CURSOR_COLORS.length];
  }, []);

  // Join room and set up subscriptions
  useEffect(() => {
    if (!user || !roomId) return;

    const setupCollaboration = async () => {
      setIsLoading(true);
      try {
        // Join room as participant
        const { error: joinError } = await supabase
          .from('room_participants')
          .upsert({
            room_id: roomId,
            user_id: user.id,
            cursor_x: 0,
            cursor_y: 0
          }, { onConflict: 'room_id,user_id' });

        if (joinError && !joinError.message.includes('duplicate')) {
          console.error('Join error:', joinError);
        }

        // Fetch initial participants
        const { data: participantsData } = await supabase
          .from('room_participants')
          .select(`
            id,
            user_id,
            cursor_x,
            cursor_y
          `)
          .eq('room_id', roomId);

        if (participantsData) {
          // Fetch profiles separately
          const userIds = participantsData.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
          
          setParticipants(participantsData.map(p => ({
            ...p,
            profile: profileMap.get(p.user_id),
            color: getUserColor(p.user_id)
          })));
        }

        // Fetch initial messages
        const { data: messagesData } = await supabase
          .from('chat_messages')
          .select('id, content, user_id, created_at')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })
          .limit(100);

        if (messagesData) {
          const userIds = [...new Set(messagesData.map(m => m.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
          
          setMessages(messagesData.map(m => ({
            ...m,
            profile: profileMap.get(m.user_id)
          })));
        }

        // Subscribe to real-time updates
        const channel = supabase
          .channel(`room:${roomId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'room_participants',
            filter: `room_id=eq.${roomId}`
          }, async (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const participant = payload.new as any;
              
              // Fetch profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, username, avatar_url')
                .eq('user_id', participant.user_id)
                .single();

              setParticipants(prev => {
                const existing = prev.findIndex(p => p.user_id === participant.user_id);
                const updated: Participant = {
                  ...participant,
                  profile,
                  color: getUserColor(participant.user_id)
                };
                
                if (existing >= 0) {
                  const newList = [...prev];
                  newList[existing] = updated;
                  return newList;
                }
                return [...prev, updated];
              });
            } else if (payload.eventType === 'DELETE') {
              setParticipants(prev => prev.filter(p => p.id !== (payload.old as any).id));
            }
          })
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          }, async (payload) => {
            const message = payload.new as any;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, username, avatar_url')
              .eq('user_id', message.user_id)
              .single();

            setMessages(prev => [...prev, { ...message, profile }]);
          })
          .subscribe();

        channelRef.current = channel;

      } catch (error) {
        console.error('Collaboration setup error:', error);
        toast.error('Failed to join collaboration room');
      } finally {
        setIsLoading(false);
      }
    };

    setupCollaboration();

    return () => {
      // Leave room on cleanup
      if (user) {
        supabase
          .from('room_participants')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .then(() => {});
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, roomId, getUserColor]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update cursor position
  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!user || !roomId) return;

    await supabase
      .from('room_participants')
      .update({ cursor_x: x, cursor_y: y })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    onCursorMove?.(x, y);
  }, [user, roomId, onCursorMove]);

  // Send message
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Copy invite link
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/collaboration/${roomId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Collaboration</span>
          <Badge variant="secondary" className="text-xs">
            {participants.length} online
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyLink}>
            <Copy className="h-3 w-3" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Participants */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Participants</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.map(participant => (
            <div 
              key={participant.id} 
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50"
              style={{ borderLeft: `3px solid ${participant.color}` }}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={participant.profile?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {participant.profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {participant.profile?.username || 'Anonymous'}
                {participant.user_id === user?.id && ' (you)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="p-2 border-b border-border flex items-center gap-2">
        <Button 
          variant={isMuted ? "outline" : "secondary"} 
          size="sm" 
          className="flex-1"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
          {isMuted ? 'Unmute' : 'Muted'}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" disabled>
          <Video className="h-3 w-3 mr-1" />
          Video
        </Button>
      </div>

      {/* Chat Toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Chat</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {messages.length}
        </Badge>
      </button>

      {/* Chat Messages */}
      {showChat && (
        <>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map(message => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div 
                      key={message.id} 
                      className={cn("flex gap-2", isOwn && "flex-row-reverse")}
                    >
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={message.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {message.profile?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-[80%]", isOwn && "text-right")}>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          {message.profile?.username || 'Anonymous'}
                        </p>
                        <div className={cn(
                          "px-2.5 py-1.5 rounded-lg text-sm",
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-border">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex gap-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-8 text-sm"
                disabled={isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8"
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// Cursor overlay for showing other users' cursors
interface CursorOverlayProps {
  participants: Participant[];
  currentUserId?: string;
  containerRef: React.RefObject<HTMLElement>;
}

export function CursorOverlay({ participants, currentUserId, containerRef }: CursorOverlayProps) {
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const newCursors = new Map<string, { x: number; y: number }>();
    participants.forEach(p => {
      if (p.user_id !== currentUserId && p.cursor_x && p.cursor_y) {
        newCursors.set(p.user_id, { x: p.cursor_x, y: p.cursor_y });
      }
    });
    setCursors(newCursors);
  }, [participants, currentUserId]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {participants
        .filter(p => p.user_id !== currentUserId)
        .map(participant => {
          const cursor = cursors.get(participant.user_id);
          if (!cursor) return null;

          return (
            <div
              key={participant.user_id}
              className="absolute transition-all duration-75 ease-out"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-2px, -2px)'
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={participant.color}
                className="drop-shadow-md"
              >
                <path d="M5.65376 12.4561L3.03516 3.03516L12.4561 5.65376L8.3938 9.71606L12.0306 13.3529L10.6164 14.7671L6.97956 11.1303L5.65376 12.4561Z" />
              </svg>
              <span 
                className="absolute left-4 top-4 px-1.5 py-0.5 rounded text-[10px] text-white whitespace-nowrap"
                style={{ backgroundColor: participant.color }}
              >
                {participant.profile?.username || 'Anonymous'}
              </span>
            </div>
          );
        })}
    </div>
  );
}
