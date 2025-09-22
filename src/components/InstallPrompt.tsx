'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share, Smartphone } from 'lucide-react';

interface InstallPromptProps {
  onClose: () => void;
}

export default function InstallPrompt({ onClose }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listener para o evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('hasShownInstall', 'true');
        onClose();
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS - mostrar instruções
      // O iOS não permite instalação programática, apenas instruções
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasShownInstall', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-gray-900 rounded-t-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Instalar LIVE VIP</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* App Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Instale o App LIVE VIP</h3>
            <p className="text-gray-400 text-sm">
              Tenha acesso rápido às melhores lives diretamente na sua tela inicial
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-sm">Acesso offline às suas lives favoritas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Share className="w-4 h-4" />
              </div>
              <span className="text-sm">Notificações de novas lives</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-sm">Experiência nativa no celular</span>
            </div>
          </div>

          {/* Install Instructions */}
          {isIOS ? (
            <div className="bg-blue-500/20 rounded-lg p-4 mb-6 border border-blue-500/30">
              <h4 className="font-semibold mb-2 text-blue-400">Como instalar no iOS:</h4>
              <ol className="text-sm text-gray-300 space-y-1">
                <li>1. Toque no botão de compartilhar (□↑) no Safari</li>
                <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>3. Toque em "Adicionar" no canto superior direito</li>
              </ol>
            </div>
          ) : (
            <div className="bg-green-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
              <h4 className="font-semibold mb-2 text-green-400">Instalação Automática:</h4>
              <p className="text-sm text-gray-300">
                Clique no botão abaixo para instalar automaticamente o app na sua tela inicial.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Instalar Agora
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="w-full bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              {isIOS ? 'Entendi' : 'Agora Não'}
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            O app é gratuito e não ocupa muito espaço no seu dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}
