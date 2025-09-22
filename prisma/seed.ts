import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@livevip.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador'
    }
  });

  console.log(`✅ Admin criado: ${adminEmail}`);

  // Criar algumas lives de exemplo
  const sampleStreams = [
    {
      title: 'Live Exclusiva - Bate Papo Intimista',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=300&fit=crop',
      videoUrl: '',
      streamerName: 'Ana Premium',
      streamerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      category: 'Lifestyle',
      viewerCount: 150,
      isVipOnly: true
    },
    {
      title: 'Música ao Vivo - Covers Exclusivos',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
      videoUrl: '',
      streamerName: 'Lucas Music',
      streamerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      category: 'Música',
      viewerCount: 89,
      isVipOnly: false
    },
    {
      title: 'Treino Premium - Funcional Avançado',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
      videoUrl: '',
      streamerName: 'Carla Fit',
      streamerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      category: 'Fitness',
      viewerCount: 234,
      isVipOnly: true
    },
    {
      title: 'Gaming Session - Gameplay Comentado',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=300&fit=crop',
      videoUrl: '',
      streamerName: 'Pedro Games',
      streamerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      category: 'Games',
      viewerCount: 67,
      isVipOnly: false
    }
  ];

  for (const stream of sampleStreams) {
    await prisma.liveStream.upsert({
      where: { 
        title: stream.title 
      },
      update: {},
      create: stream
    });
  }

  console.log('✅ Lives de exemplo criadas');

  // Criar usuário de teste premium
  const testUser = await prisma.user.upsert({
    where: { email: 'usuario@teste.com' },
    update: {},
    create: {
      email: 'usuario@teste.com',
      name: 'Usuário Teste',
      isPremium: true,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    }
  });

  // Criar pagamento de exemplo para o usuário teste
  await prisma.payment.upsert({
    where: { kirvanoOrderId: 'test-order-123' },
    update: {},
    create: {
      userId: testUser.id,
      kirvanoOrderId: 'test-order-123',
      planType: 'monthly',
      amount: 49.90,
      status: 'completed',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      webhookData: {
        test: true,
        created_at: new Date().toISOString()
      }
    }
  });

  console.log('✅ Usuário de teste premium criado');
  console.log('🎉 Seed concluído com sucesso!');
  
  console.log('\n📋 Informações importantes:');
  console.log(`Admin Email: ${adminEmail}`);
  console.log(`Admin Password: ${adminPassword}`);
  console.log('Usuário teste: usuario@teste.com (Premium por 30 dias)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
