
const fs = require('fs');
const path = require('path');

// Script para preparar build mobile
console.log('🚀 Preparando build do aplicativo mobile...');

// Criar diretório de assets se não existir
const assetsDir = path.join(__dirname, 'public', 'mobile-assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('📁 Diretório de assets criado');
}

// Criar arquivo de informações do APK
const apkInfo = {
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  size: '12.5 MB',
  downloadUrl: '/mobile-assets/gestor-connect-mobile.apk',
  changelog: [
    'Versão inicial do aplicativo',
    'Overlay inteligente para WhatsApp',
    'Sincronização com painel web',
    'Templates personalizados',
    'Ações rápidas de cobrança'
  ]
};

fs.writeFileSync(
  path.join(assetsDir, 'apk-info.json'),
  JSON.stringify(apkInfo, null, 2)
);

console.log('✅ Informações do APK geradas');
console.log('📱 Para gerar o APK real, execute:');
console.log('   npx cap add android');
console.log('   npm run build');
console.log('   npx cap sync');
console.log('   npx cap open android');

// Criar arquivo README para mobile
const mobileReadme = `# Gestor Connect Mobile

## Funcionalidades
- Overlay inteligente no WhatsApp
- Detecção automática de clientes
- Templates de mensagem
- Ações rápidas de cobrança
- Sincronização em tempo real

## Como usar
1. Instale o APK no dispositivo Android
2. Conceda permissões de overlay e acessibilidade
3. Faça login com suas credenciais
4. Ative o monitoramento do WhatsApp
5. O overlay aparecerá automaticamente quando necessário

## Compilação
Para compilar o APK:
\`\`\`bash
npm run build
npx cap sync
npx cap open android
\`\`\`

No Android Studio, gere o APK via Build > Build Bundle(s) / APK(s) > Build APK(s)
`;

fs.writeFileSync(path.join(__dirname, 'MOBILE.md'), mobileReadme);
console.log('📚 Documentação mobile criada em MOBILE.md');

console.log('✅ Setup mobile concluído!');
