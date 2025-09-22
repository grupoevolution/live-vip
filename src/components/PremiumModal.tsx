'use client';

import { useState } from 'react';
import { X, Crown, Check, Star, Zap, Heart, Shield } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({ onClose, onUpgrade }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      id: 'weekly',
      name: 'Semanal',
      price: 'R$ 19,90',
      period: '/semana',
      savings: '',
      popular: false
    },
    {
      id: 'monthly',
      name: 'Mensal',
      price: 'R$ 49,90',
      period: '/mês',
      savings: 'Economize 37%',
      popular: true
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 'R$ 299,90',
      period: '/ano',
      savings: 'Economize 50%',
      popular: false
    }
  ];

  const features = [
    { icon: Zap, text: 'Acesso ilimitado a todas as lives' },
    { icon: Heart, text: 'Comentários sem limites' },
    { icon: Star, text: 'Lives exclusivas VIP' },
    { icon: Crown, text: 'Badge Premium no perfil' },
    { icon: Shield, text: 'Suporte prioritário 24/7' },
    { icon: Check, text: 'Sem anúncios' }
  ];

  const handleUpgrade = () => {
    // Simular processo de pagamento
    setTimeout(() => {
      onUpgrade();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Seja Premium!</h2>
          <p className="text-white/80">Desbloqueie todo o conteúdo exclusivo</p>
        </div>

        <div className="p-6">
          {/* Features */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4">O que você ganha:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4">Escolha seu plano:</h3>
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      MAIS POPULAR
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{plan.name}</h4>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-purple-400">{plan.price}</span>
                        <span className="text-gray-400 text-sm">{plan.period}</span>
                      </div>
                      {plan.savings && (
                        <span className="text-green-400 text-sm font-medium">{plan.savings}</span>
                      )}
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedPlan === plan.id && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">100% Seguro</span>
            </div>
            <p className="text-sm text-gray-400">
              Pagamento processado com segurança. Cancele a qualquer momento.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              Assinar Agora - {plans.find(p => p.id === selectedPlan)?.price}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Continuar Grátis (5 min restantes)
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Ao continuar, você concorda com nossos{' '}
            <span className="text-purple-400 underline">Termos de Uso</span> e{' '}
            <span className="text-purple-400 underline">Política de Privacidade</span>
          </p>
        </div>
      </div>
    </div>
  );
}
