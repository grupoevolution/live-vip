'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Volume2, VolumeX, MessageCircle, Heart, Share2, Users, Crown, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';

interface LivePlayerProps {
  stream: {
    id: string;
    title: string;
    videoUrl: string;
    viewerCount: number;
    streamerName: string;
    streamerAvatar: string;
    thumbnail: string;
  };
  allStreams: Array<{
    id: string;
    title: string;
    videoUrl: string;
    viewerCount: number;
    streamerName: string;
    streamerAvatar: string;
    thumbnail: string;
    category: string;
  }>;
  onClose: () => void;
  onStreamChange: (stream: any) => void;
  isPremium: boolean;
  watchTime: number;
}

interface Comment {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  avatar: string;
}

export default function LivePlayer({ stream, allStreams, onClose, onStreamChange, isPremium, watchTime }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [hasLiked, setHasLiked] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  
  // Estados para swipe
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Comentários simulados
  const simulatedComments = [
    { user: 'João123', message: 'Que show incrível! 🔥', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
    { user: 'Maria_VIP', message: 'Melhor live da semana!', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' },
    { user: 'Pedro_Fan', message: 'Quando vai ser a próxima?', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
    { user: 'Ana_Live', message: 'Conteúdo premium mesmo! 💎', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' },
    { user: 'Carlos_VIP', message: 'Vale muito a pena ser premium', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face' }
  ];

  // Encontrar índice da stream atual
  useEffect(() => {
    const index = allStreams.findIndex(s => s.id === stream.id);
    setCurrentStreamIndex(index >= 0 ? index : 0);
  }, [stream.id, allStreams]);

  // Adicionar comentários simulados
  useEffect(() => {
    const interval = setInterval(() => {
      const randomComment = simulatedComments[Math.floor(Math.random() * simulatedComments.length)];
      const newComment: Comment = {
        id: Date.now().toString(),
        user: randomComment.user,
        message: randomComment.message,
        timestamp: Date.now(),
        avatar: randomComment.avatar
      };
      
      setComments(prev => [...prev.slice(-20), newComment]);
    }, Math.random() * 8000 + 3000);

    return () => clearInterval(interval);
  }, []);

  // Configurar vídeo - SEMPRE AUTO-PLAY, SEM PAUSA
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream.videoUrl) {
      video.muted = isMuted;
      video.volume = volume;
      video.playsInline = true;
      video.controls = false;
      video.loop = true; // Loop para manter sempre rodando
      
      const handleLoadedData = () => {
        console.log('✅ Video loaded successfully');
        setHasVideoError(false);
        // Auto-play imediato
        video.play().catch(console.log);
      };
      
      const handleError = (e: any) => {
        console.error('❌ Video error:', e);
        setHasVideoError(true);
      };
      
      // Impedir pausa - se usuário pausar, volta a tocar
      const handlePause = () => {
        setTimeout(() => {
          if (!video.ended) {
            video.play().catch(console.log);
          }
        }, 100);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      video.addEventListener('pause', handlePause);
      
      // Forçar play inicial
      setTimeout(() => {
        video.play().catch(error => {
          console.log('Autoplay prevented:', error);
        });
      }, 200);
      
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [stream.videoUrl, isMuted, volume]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  // Funções de navegação
  const goToNextStream = () => {
    if (currentStreamIndex < allStreams.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      const nextStream = allStreams[currentStreamIndex + 1];
      onStreamChange(nextStream);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToPrevStream = () => {
    if (currentStreamIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      const prevStream = allStreams[currentStreamIndex - 1];
      onStreamChange(prevStream);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handlers de touch para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY || !touchStartX) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = Math.abs(touchStartX - touchEndX);

    // Só processa se o movimento é mais vertical que horizontal
    if (Math.abs(diffY) > 50 && diffX < 100) {
      if (diffY > 0) {
        // Swipe up - próxima live
        goToNextStream();
      } else {
        // Swipe down - live anterior
        goToPrevStream();
      }
    }

    setTouchStartY(0);
    setTouchStartX(0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        video.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        video.muted = false;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && !isPremium) {
      alert('Upgrade para Premium para comentar sem limites!');
      return;
    }
    
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'Você',
        message: newComment,
        timestamp: Date.now(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = 300 - watchTime;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Container com Swipe */}
      <div 
        ref={containerRef}
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowControls(true)}
      >
        {/* Video Element ou Fallback */}
        {stream.videoUrl && !hasVideoError ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={stream.videoUrl}
            poster={stream.thumbnail}
            playsInline
            muted={isMuted}
            loop
            autoPlay
            // Remover controles nativos completamente
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${stream.thumbnail})` }}
          >
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-white/80">Live Stream</p>
                <p className="text-sm text-white/60 mt-2">{stream.title}</p>
                {hasVideoError && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Vídeo indisponível - Preview da live
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay de transição */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white/20 rounded-full p-4">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Live Indicator */}
        <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>AO VIVO</span>
        </div>

        {/* Stream Counter */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full text-sm">
          {currentStreamIndex + 1} de {allStreams.length}
        </div>

        {/* Viewer Count */}
        <div className="absolute top-4 right-16 bg-black/70 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{stream.viewerCount}</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Timer for Free Users */}
        {!isPremium && (
          <div className="absolute top-16 right-4 bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
            {formatTime(remainingTime)} restantes
          </div>
        )}

        {/* Swipe Indicators */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          {/* Indicador anterior */}
          {currentStreamIndex > 0 && (
            <button
              onClick={goToPrevStream}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
          
          {/* Indicador próxima */}
          {currentStreamIndex < allStreams.length - 1 && (
            <button
              onClick={goToNextStream}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Instruções de Swipe (aparecem só no início) */}
        {showControls && (
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
              <p className="text-sm text-white/80">👆 Deslize para cima para próxima live</p>
              <p className="text-xs text-white/60">👇 Deslize para baixo para anterior</p>
            </div>
          </div>
        )}

        {/* Controls Overlay - SEM PAUSE */}
        {showControls && (
          <div className="absolute inset-0 bg-black/20">
            {/* Bottom Controls - Só Volume e Fullscreen */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={stream.streamerAvatar}
                    alt={stream.streamerName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{stream.streamerName}</p>
                    <p className="text-sm text-gray-300">{stream.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Volume Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 accent-purple-500"
                    />
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4">
          <button
            onClick={handleLike}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all ${
              hasLiked ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Heart className={`w-6 h-6 ${hasLiked ? 'fill-white' : ''}`} />
            <span className="text-xs mt-1">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="w-12 h-12 bg-white/20 rounded-full flex flex-col items-center justify-center hover:bg-white/30 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">{comments.length}</span>
          </button>

          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>

          {!isPremium && (
            <button 
              onClick={() => alert('Upgrade para Premium para recursos exclusivos!')}
              className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Crown className="w-6 h-6 text-black" />
            </button>
          )}
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-black/90 backdrop-blur-sm">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Chat ao Vivo ({comments.length})</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-purple-400">{comment.user}</span>
                        <span className="ml-2">{comment.message}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isPremium ? "Digite seu comentário..." : "Upgrade para comentar"}
                  disabled={!isPremium}
                  className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!isPremium}
                  className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-purple-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
