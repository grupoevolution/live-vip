'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Users, MessageCircle, Heart, Share2, Crown, User, Home, Search } from 'lucide-react';
import LivePlayer from '@/components/LivePlayer';
import ProfileModal from '@/components/ProfileModal';
import PremiumModal from '@/components/PremiumModal';
import InstallPrompt from '@/components/InstallPrompt';

interface LiveStream {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  viewerCount: number;
  isLive: boolean;
  streamerName: string;
  streamerAvatar: string;
  category: string;
  isVipOnly?: boolean;
}

interface UserData {
  email: string;
  name?: string;
  isPremium: boolean;
  premiumUntil?: string;
}

export default function HomePage() {
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar streams da API
  const fetchStreams = useCallback(async () => {
    try {
      const response = await fetch('/api/streams');
      const data = await response.json();
      
      if (response.ok) {
        setLiveStreams(data.streams || []);
        setError(null);
      } else {
        setError('Erro ao carregar lives');
        console.error('Error fetching streams:', data.error);
      }
    } catch (error) {
      setError('Erro de conexão');
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para verificar status premium do usuário
  const checkPremiumStatus = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/user/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserData({
          email,
          name: data.user?.name,
          isPremium: data.isPremium,
          premiumUntil: data.premiumUntil
        });
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    // Carregar streams
    fetchStreams();
    
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserData(user);
        if (user.email) {
          checkPremiumStatus(user.email);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('userData');
      }
    }
    
    // Verificar prompt de instalação
    const hasShownInstall = localStorage.getItem('hasShownInstall');
    if (!hasShownInstall) {
      setTimeout(() => setShowInstall(true), 3000);
    }
  }, [fetchStreams, checkPremiumStatus]);

  // Auto-refresh streams a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  // Timer para usuários gratuitos
  useEffect(() => {
    if (currentStream && !userData?.isPremium) {
      const timer = setInterval(() => {
        setWatchTime(prev => {
          if (prev >= 300) {
            setShowPremium(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStream, userData?.isPremium]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = 300 - watchTime;

  // Filtrar streams baseado no status premium
  const visibleStreams = liveStreams.filter(stream => {
    if (stream.isVipOnly && !userData?.isPremium) {
      return false; // Stream VIP e usuário não premium
    }
    return true;
  });

  const vipStreamsCount = liveStreams.filter(s => s.isVipOnly).length;

  const handleStreamClick = (stream: LiveStream) => {
    // Verificar se stream é VIP e usuário não é premium
    if (stream.isVipOnly && !userData?.isPremium) {
      setShowPremium(true);
      return;
    }
    
    setCurrentStream(stream);
    setWatchTime(0);
  };

  // Simular login rápido para demonstração
  const handleQuickLogin = async () => {
    const email = prompt('Digite seu email para acessar:');
    if (email) {
      const newUserData = {
        email,
        isPremium: false,
        name: email.split('@')[0]
      };
      
      setUserData(newUserData);
      localStorage.setItem('userData', JSON.stringify(newUserData));
      
      // Verificar status premium real
      await checkPremiumStatus(email);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold">LIVE VIP</h1>
            {userData?.isPremium && (
              <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                PREMIUM
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {!userData?.isPremium && currentStream && (
              <div className="bg-red-500 px-2 py-1 rounded-full text-xs font-bold">
                {formatTime(remainingTime)} restantes
              </div>
            )}
            
            {userData ? (
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"
              >
                <User className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleQuickLogin}
                className="bg-white/20 px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        {currentStream ? (
          <LivePlayer
            stream={currentStream}
            onClose={() => {
              setCurrentStream(null);
              setWatchTime(0);
            }}
            isPremium={userData?.isPremium || false}
            watchTime={watchTime}
          />
        ) : (
          <div className="p-4">
            {/* Premium Banner */}
            {!userData?.isPremium && visibleStreams.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-black">Seja Premium!</h3>
                    <p className="text-sm text-black/80">
                      Acesso ilimitado + {vipStreamsCount} lives exclusivas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPremium(true)}
                    className="bg-black text-white px-4 py-2 rounded-full font-bold"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            {/* User Welcome */}
            {userData && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-lg mb-1">
                  Olá, {userData.name || userData.email.split('@')[0]}! 👋
                </h3>
                <p className="text-gray-400 text-sm">
                  {userData.isPremium 
                    ? `Premium ativo até ${userData.premiumUntil ? new Date(userData.premiumUntil).toLocaleDateString('pt-BR') : 'indefinido'}`
                    : 'Upgrade para Premium e tenha acesso ilimitado'
                  }
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando lives...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2 text-red-400">Erro ao carregar</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={fetchStreams}
                  className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Lives Grid */}
            {!loading && !error && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">🔴 Ao Vivo Agora</h2>
                  <div className="text-sm text-gray-400 flex items-center space-x-2">
                    <span>{visibleStreams.length} lives disponíveis</span>
                    <button 
                      onClick={fetchStreams}
                      className="text-blue-400 hover:text-blue-300"
                      title="Atualizar"
                    >
                      🔄
                    </button>
                  </div>
                </div>
                
                {visibleStreams.length === 0 ? (
                  // Empty State
                  <div className="text-center py-12">
                    <div className="mb-4 text-6xl">📺</div>
                    <h3 className="text-xl font-bold mb-2">Nenhuma live disponível</h3>
                    <p className="text-gray-400 mb-6">
                      {liveStreams.length > 0 
                        ? 'Faça upgrade para Premium e tenha acesso a todas as lives!'
                        : 'Em breve teremos lives exclusivas para você!'
                      }
                    </p>
                    {liveStreams.length > 0 && !userData?.isPremium && (
                      <button
                        onClick={() => setShowPremium(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-colors"
                      >
                        Ser Premium Agora
                      </button>
                    )}
                  </div>
                ) : (
                  // Lives List
                  <>
                    {visibleStreams.map((stream) => (
                      <div
                        key={stream.id}
                        onClick={() => handleStreamClick(stream)}
                        className="relative rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                      >
                        <img
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="w-full h-48 object-cover"
                        />
                        
                        {/* Live Badge */}
                        <div className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>AO VIVO</span>
                        </div>

                        {/* VIP Badge */}
                        {stream.isVipOnly && (
                          <div className="absolute top-3 left-20 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                            <Crown className="w-3 h-3" />
                            <span>VIP</span>
                          </div>
                        )}

                        {/* Viewer Count */}
                        <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{stream.viewerCount}</span>
                        </div>

                        {/* Stream Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={stream.streamerAvatar}
                              alt={stream.streamerName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-sm">{stream.streamerName}</p>
                              <p className="text-xs text-gray-300">{stream.category}</p>
                            </div>
                          </div>
                          <h3 className="font-bold">{stream.title}</h3>
                        </div>
                      </div>
                    ))}

                    {/* VIP Streams Locked */}
                    {!userData?.isPremium && vipStreamsCount > 0 && (
                      <div 
                        onClick={() => setShowPremium(true)}
                        className="relative rounded-lg overflow-hidden cursor-pointer bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 p-6 text-center"
                      >
                        <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">+{vipStreamsCount} Lives VIP Exclusivas</h3>
                        <p className="text-gray-300 mb-4">
                          Conteúdo premium disponível apenas para assinantes
                        </p>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold inline-block">
                          Desbloquear Agora
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 ${activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Início</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center p-2 ${activeTab === 'search' ? 'text-purple-400' : 'text-gray-400'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Buscar</span>
          </button>
          <button
            onClick={() => setShowPremium(true)}
            className="flex flex-col items-center p-2 text-yellow-400"
          >
            <Crown className="w-5 h-5" />
            <span className="text-xs mt-1">Premium</span>
          </button>
          <button
            onClick={() => userData ? setShowProfile(true) : handleQuickLogin()}
            className={`flex flex-col items-center p-2 ${activeTab === 'profile' ? 'text-purple-400' : 'text-gray-400'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {showProfile && userData && (
        <ProfileModal 
          onClose={() => setShowProfile(false)}
          userData={userData}
          onUpdateUser={setUserData}
        />
      )}

      {showPremium && (
        <PremiumModal
          onClose={() => setShowPremium(false)}
          onUpgrade={() => {
            if (userData) {
              const updatedUser = { ...userData, isPremium: true };
              setUserData(updatedUser);
              localStorage.setItem('userData', JSON.stringify(updatedUser));
            }
            setShowPremium(false);
            setWatchTime(0);
          }}
          userData={userData}
        />
      )}

      {showInstall && (
        <InstallPrompt onClose={() => setShowInstall(false)} />
      )}
    </div>
  );
}
