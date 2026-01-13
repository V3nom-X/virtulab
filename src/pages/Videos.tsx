import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, ExternalLink, Play, Clock, Users, Star, Filter,
  Atom, FlaskConical, Dna, Globe, Rocket, Brain, Lightbulb, Sparkles
} from 'lucide-react';

interface VideoChannel {
  id: string;
  name: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  subscribers: string;
  category: string;
  topics: string[];
  featured?: boolean;
}

interface VideoPlaylist {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  videoCount: number;
  duration: string;
  category: string;
  channel: string;
}

const channels: VideoChannel[] = [
  {
    id: 'veritasium',
    name: 'Veritasium',
    description: 'Science videos covering physics, engineering, and fascinating phenomena. Deep dives into how things work.',
    youtubeUrl: 'https://www.youtube.com/@veritasium',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nM_5LpfYJGmE6Yd1DpxQxGLh0a9oExVYYO1WaFKa-A=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '15M+',
    category: 'Physics',
    topics: ['Physics', 'Engineering', 'Math'],
    featured: true,
  },
  {
    id: 'drbinocs',
    name: 'Dr. Binocs Show',
    description: 'Fun animated educational videos for kids and curious minds. Learn science through entertaining cartoons.',
    youtubeUrl: 'https://www.youtube.com/@PeekabooKidz',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mKNGLRnBqLjCSUODy1NLs_TluGkGSSPuLqN-Yqlg=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '20M+',
    category: 'General Science',
    topics: ['Biology', 'Physics', 'Chemistry', 'Earth Science'],
    featured: true,
  },
  {
    id: 'kurzgesagt',
    name: 'Kurzgesagt – In a Nutshell',
    description: 'Beautiful animated explanations of complex science topics from the Big Bang to immune cells.',
    youtubeUrl: 'https://www.youtube.com/@kurzgesagt',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mW8zV_9sBtPt-qSsVE3T6jTqPqxgC7EqH0EY8UbA=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '22M+',
    category: 'General Science',
    topics: ['Space', 'Biology', 'Physics', 'Philosophy'],
    featured: true,
  },
  {
    id: 'minutephysics',
    name: 'MinutePhysics',
    description: 'Quick, hand-drawn physics explanations. Complex concepts made simple in just a few minutes.',
    youtubeUrl: 'https://www.youtube.com/@MinutePhysics',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kVBxQYGPZ8nkdFBWFIX7KjVDI-u9h_6H9TUqyX=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '5.5M+',
    category: 'Physics',
    topics: ['Physics', 'Quantum Mechanics', 'Relativity'],
  },
  {
    id: 'smartereveryday',
    name: 'SmarterEveryDay',
    description: 'Explore the world using science! In-depth investigations into everyday phenomena and engineering.',
    youtubeUrl: 'https://www.youtube.com/@smartereveryday',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_lhVpL7pE2D42Q8A4HoS66J2cplTPW2H4_2VUmx=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '11M+',
    category: 'Engineering',
    topics: ['Engineering', 'Physics', 'Space'],
  },
  {
    id: 'actionlab',
    name: 'The Action Lab',
    description: 'Incredible science experiments you can try at home. From chemistry reactions to physics demos.',
    youtubeUrl: 'https://www.youtube.com/@TheActionLab',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_lhGe3eQ5EjuKqMkzLK4SxEWm6rBc7xlAVB7t0U=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '7M+',
    category: 'Experiments',
    topics: ['Chemistry', 'Physics', 'Experiments'],
  },
  {
    id: 'stevemould',
    name: 'Steve Mould',
    description: 'Science experiments, explanations and demonstrations. Discover the science behind everyday things.',
    youtubeUrl: 'https://www.youtube.com/@SteveMould',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mRIqtBnp0G-vqQJHfP8EqGtpRQJH4hDuqfhmTQyg=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '3M+',
    category: 'Physics',
    topics: ['Physics', 'Mathematics', 'Experiments'],
  },
  {
    id: '3blue1brown',
    name: '3Blue1Brown',
    description: 'Beautiful visual mathematics explanations. Linear algebra, calculus, and more brought to life.',
    youtubeUrl: 'https://www.youtube.com/@3blue1brown',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_m_ERz0tCJ8lYfhvxmGsQLEQRj8gHR3_TTL3Zyp=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '6M+',
    category: 'Mathematics',
    topics: ['Mathematics', 'Linear Algebra', 'Calculus'],
  },
  {
    id: 'nilered',
    name: 'NileRed',
    description: 'Chemistry experiments and synthesis. Watch fascinating chemical reactions and learn chemistry.',
    youtubeUrl: 'https://www.youtube.com/@NileRed',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_l2cSbG6Ej0LfQ-9z_m8jGGZfKXRqzVXTsJKHI=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '5M+',
    category: 'Chemistry',
    topics: ['Chemistry', 'Organic Chemistry', 'Experiments'],
    featured: true,
  },
  {
    id: 'pbsspacetime',
    name: 'PBS Space Time',
    description: 'Advanced physics and astrophysics topics. Black holes, quantum mechanics, and the nature of reality.',
    youtubeUrl: 'https://www.youtube.com/@pbsspacetime',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nNwqGNzP-wVnLWlMT4lMZe0Hpz9K5wRdCkW3o=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '3M+',
    category: 'Space',
    topics: ['Physics', 'Astrophysics', 'Quantum Mechanics'],
  },
  {
    id: 'crashcourse',
    name: 'CrashCourse',
    description: 'Comprehensive educational courses on every science topic. Perfect for students and learners.',
    youtubeUrl: 'https://www.youtube.com/@crashcourse',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mHVh1YvvhB_F9b5X0wMpV_aEz8d4_1kWQRNw=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '15M+',
    category: 'General Science',
    topics: ['Biology', 'Chemistry', 'Physics', 'History'],
  },
  {
    id: 'markrober',
    name: 'Mark Rober',
    description: 'Former NASA engineer creates incredible science projects and experiments with amazing production.',
    youtubeUrl: 'https://www.youtube.com/@MarkRober',
    thumbnailUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_mCmR38D_erJGG2tS7OhT0jL5h0LO_xUvKVTw=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '28M+',
    category: 'Engineering',
    topics: ['Engineering', 'Physics', 'Experiments'],
    featured: true,
  },
];

const playlists: VideoPlaylist[] = [
  {
    id: 'physics101',
    title: 'Physics Fundamentals',
    description: 'Complete introduction to physics concepts from mechanics to electromagnetism.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtN0ge7yDk_UA0ldZJdhwkoV',
    thumbnailUrl: 'https://i.ytimg.com/vi/OoO5d5P0Jn4/hqdefault.jpg',
    videoCount: 46,
    duration: '8h 30m',
    category: 'Physics',
    channel: 'CrashCourse',
  },
  {
    id: 'chemistry101',
    title: 'Chemistry Basics',
    description: 'Learn chemistry from atoms to reactions with animated explanations.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr',
    thumbnailUrl: 'https://i.ytimg.com/vi/FSyAehMdpyI/hqdefault.jpg',
    videoCount: 46,
    duration: '9h 15m',
    category: 'Chemistry',
    channel: 'CrashCourse',
  },
  {
    id: 'biology101',
    title: 'Biology Essentials',
    description: 'Explore life from cells to ecosystems in this comprehensive biology course.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF',
    thumbnailUrl: 'https://i.ytimg.com/vi/QnQe0xW_JY4/hqdefault.jpg',
    videoCount: 40,
    duration: '7h 45m',
    category: 'Biology',
    channel: 'CrashCourse',
  },
  {
    id: 'quantumphysics',
    title: 'Quantum Physics Explained',
    description: 'Understand the strange world of quantum mechanics with visual explanations.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLsPUh22kYmNDnQ7V2t-oC64xVZSz2R4dF',
    thumbnailUrl: 'https://i.ytimg.com/vi/p7bzE1E5PMY/hqdefault.jpg',
    videoCount: 15,
    duration: '2h 30m',
    category: 'Physics',
    channel: 'MinutePhysics',
  },
  {
    id: 'linearalgebra',
    title: 'Essence of Linear Algebra',
    description: 'Visual and intuitive approach to understanding linear algebra fundamentals.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    thumbnailUrl: 'https://i.ytimg.com/vi/fNk_zzaMoSs/hqdefault.jpg',
    videoCount: 16,
    duration: '3h 15m',
    category: 'Mathematics',
    channel: '3Blue1Brown',
  },
  {
    id: 'spacescience',
    title: 'Space & Astronomy',
    description: 'Journey through the cosmos exploring planets, stars, and the universe.',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLl-lEbqDWpS9nVLQyPR6bMQqFtGknEq',
    thumbnailUrl: 'https://i.ytimg.com/vi/xMq-FyrcuNs/hqdefault.jpg',
    videoCount: 25,
    duration: '4h 20m',
    category: 'Space',
    channel: 'Kurzgesagt',
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Physics': <Atom className="w-4 h-4" />,
  'Chemistry': <FlaskConical className="w-4 h-4" />,
  'Biology': <Dna className="w-4 h-4" />,
  'Earth Science': <Globe className="w-4 h-4" />,
  'Space': <Rocket className="w-4 h-4" />,
  'Mathematics': <Brain className="w-4 h-4" />,
  'General Science': <Lightbulb className="w-4 h-4" />,
  'Engineering': <Sparkles className="w-4 h-4" />,
  'Experiments': <FlaskConical className="w-4 h-4" />,
};

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(channels.map(c => c.category))];

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = searchQuery === '' ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = searchQuery === '' ||
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || playlist.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredChannels = channels.filter(c => c.featured);

  return (
    <Layout>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Educational Videos</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Discover the best science YouTube channels and playlists to enhance your learning experience.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5 gap-1"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {categoryIcons[cat]}
                    <span className="hidden sm:inline">{cat}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            {/* Channels Tab */}
            <TabsContent value="channels">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredChannels.map(channel => (
                  <Card key={channel.id} className="hover-lift group overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={channel.thumbnailUrl} 
                            alt={channel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${channel.name}&background=random`;
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base truncate">{channel.name}</CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Users className="w-3 h-3" />
                            <span>{channel.subscribers}</span>
                          </div>
                        </div>
                        {channel.featured && (
                          <Star className="w-4 h-4 text-warning shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs line-clamp-2 mb-3">
                        {channel.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {channel.topics.slice(0, 3).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <a 
                        href={channel.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="w-full gap-1.5">
                          <Play className="w-3 h-3" />
                          Watch on YouTube
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredChannels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No channels found matching your search.</p>
                </div>
              )}
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlaylists.map(playlist => (
                  <Card key={playlist.id} className="hover-lift overflow-hidden">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img 
                        src={playlist.thumbnailUrl}
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/480x270?text=Playlist';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                          {playlist.videoCount} videos
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {playlist.duration}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {categoryIcons[playlist.category]}
                        <Badge variant="outline" className="text-xs">{playlist.category}</Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-1">{playlist.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">by {playlist.channel}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs line-clamp-2 mb-3">
                        {playlist.description}
                      </CardDescription>
                      <a 
                        href={playlist.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="w-full gap-1.5">
                          <Play className="w-3 h-3" />
                          Open Playlist
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPlaylists.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No playlists found matching your search.</p>
                </div>
              )}
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Top Science Channels</h2>
                  <p className="text-muted-foreground">Our recommended channels for science enthusiasts</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredChannels.map(channel => (
                    <Card key={channel.id} className="hover-lift overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 p-4 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
                            <img 
                              src={channel.thumbnailUrl}
                              alt={channel.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${channel.name}&background=random&size=200`;
                              }}
                            />
                          </div>
                        </div>
                        <div className="sm:w-2/3 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{channel.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{channel.subscribers} subscribers</span>
                              </div>
                            </div>
                            <Star className="w-5 h-5 text-warning fill-warning" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {channel.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {channel.topics.map(topic => (
                              <Badge key={topic} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <a 
                            href={channel.youtubeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="gap-1.5">
                              <Play className="w-3 h-3" />
                              Visit Channel
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Videos;
