'use client';

import { useState } from 'react';
import { X, Camera, User, Heart, MapPin, Calendar } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    interests: [] as string[],
    location: '',
    avatar: ''
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = [
    'Música', 'Dança', 'Entretenimento', 'Lifestyle', 'Fitness',
    'Culinária', 'Viagem', 'Arte', 'Tecnologia', 'Moda',
    'Beleza', 'Esportes', 'Games', 'Filmes', 'Literatura'
  ];

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      interests: selectedInterests
    };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Meu Perfil</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Toque para alterar foto</p>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome"
                className="w-full bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Idade</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Sua idade"
                className="w-full bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Sua cidade"
                  className="w-full bg-gray-800 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                rows={3}
                className="w-full bg-gray-800 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-3">Interesses</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Selecione seus interesses para personalizar sua experiência
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400">Recursos Premium</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Perfil verificado com badge</li>
              <li>• Comentários ilimitados</li>
              <li>• Acesso a lives exclusivas</li>
              <li>• Chat privado com streamers</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
