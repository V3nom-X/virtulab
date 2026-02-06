import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Send, 
  Users, 
  MessageCircle, 
  Copy, 
  LogOut,
  Play,
  Pause,
  Settings2,
  Loader2
} from 'lucide-react';
import { PendulumSimulation } from '@/components/simulations/PendulumSimulation';
import { ComingSoonOverlay } from '@/components/overlays/ComingSoonOverlay';

interface Participant {
  id: string;
  user_id: string;
  cursor_x: number;
  cursor_y: number;
  profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string | null;
    full_name: string | null;
  };
}

const Collaboration = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [room, setRoom] = useState<{ name: string; host_id: string } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [simParams, setSimParams] = useState({
    mass: 1.5,
    length: 1,
    gravity: 9.8,
    angle: 45
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch room data
  useEffect(() => {
    if (!roomId || !user) return;

    const fetchRoom = async () => {
      const { data: roomData, error } = await supabase
        .from('collaboration_rooms')
        .select('name, host_id')
        .eq('id', roomId)
        .single();

      if (error || !roomData) {
        toast.error('Room not found');
        navigate('/community');
        return;
      }

      setRoom(roomData);

      // Join the room
      const { error: joinError } = await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          cursor_x: 0,
          cursor_y: 0
        });

      if (joinError) {
        console.error('Error joining room:', joinError);
      }

      // Fetch existing messages
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }

      // Fetch participants
      const { data: participantsData } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', roomId);

      if (participantsData) {
        setParticipants(participantsData);
      }

      setLoading(false);
    };

    fetchRoom();

    // Subscribe to realtime updates
    const participantsChannel = supabase
      .channel(`room-participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => [...prev, payload.new as Participant]);
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev => 
              prev.map(p => p.id === (payload.new as Participant).id ? payload.new as Participant : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.id !== (payload.old as Participant).id));
          }
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [roomId, user, navigate]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track cursor position
  useEffect(() => {
    if (!canvasRef.current || !roomId || !user) return;

    const handleMouseMove = async (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      await supabase
        .from('room_participants')
        .update({ cursor_x: x, cursor_y: y })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [roomId, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.id,
        content: newMessage.trim()
      });

    if (error) {
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
  };

  const leaveRoom = async () => {
    if (!roomId || !user) return;

    await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    navigate('/community');
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Room link copied!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to join collaboration rooms.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col lg:flex-row relative">
        <ComingSoonOverlay 
          title="Collaboration Coming Soon"
          features={[
            "Real-time co-experimentation with classmates",
            "Shared experiment workspaces",
            "Voice and video chat during experiments",
            "Collaborative data collection and analysis",
            "Teacher-led guided experiment sessions"
          ]}
        />
        {/* Main Collaboration Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Live</Badge>
              <h1 className="font-semibold">{room?.name || 'Collaboration Room'}</h1>
              <Badge variant="outline" className="gap-1">
                <Users className="w-3 h-3" />
                {participants.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyRoomLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="ghost" size="sm" onClick={leaveRoom}>
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>

          {/* Simulation Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-gradient-to-b from-muted/50 to-muted"
          >
            <PendulumSimulation
              mass={simParams.mass}
              length={simParams.length}
              gravity={simParams.gravity}
              angle={simParams.angle}
              isPlaying={isPlaying}
              speed={1}
            />

            {/* Other participants' cursors */}
            {participants
              .filter(p => p.user_id !== user.id)
              .map(participant => (
                <div
                  key={participant.id}
                  className="absolute pointer-events-none z-50 transition-all duration-75"
                  style={{
                    left: participant.cursor_x,
                    top: participant.cursor_y,
                    transform: 'translate(-2px, -2px)'
                  }}
                >
                  <div className="w-4 h-4 bg-primary rounded-full opacity-75" />
                  <span className="absolute top-4 left-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded whitespace-nowrap">
                    {participant.profile?.username || 'User'}
                  </span>
                </div>
              ))}
          </div>

          {/* Bottom Controls */}
          <div className="h-16 border-t bg-card px-4 flex items-center gap-4">
            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button variant="outline" size="icon">
              <Settings2 className="w-4 h-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Pendulum Simulation • Shared Controls
            </div>
          </div>
        </div>

        {/* Right Sidebar - Participants & Chat */}
        <div className="w-full lg:w-80 border-l bg-card flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={participant.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(participant.profile?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.profile?.full_name || participant.profile?.username || 'Anonymous'}
                    </p>
                    {participant.user_id === room?.host_id && (
                      <Badge variant="secondary" className="text-xs">Host</Badge>
                    )}
                  </div>
                  {participant.user_id === user.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`flex gap-2 ${message.user_id === user.id ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarFallback className="text-xs">
                        {(message.profile?.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] ${message.user_id === user.id ? 'text-right' : ''}`}>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {message.profile?.username || 'User'}
                      </p>
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        message.user_id === user.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Collaboration;
