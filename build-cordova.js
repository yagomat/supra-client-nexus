
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando build do Cordova...');

// 1. Build do projeto React/Vite
console.log('📦 Fazendo build do projeto...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build concluído');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}

// 2. Criar diretório www se não existir
const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

// 3. Copiar arquivos do dist para www
console.log('📁 Copiando arquivos para www...');
try {
  execSync('cp -r dist/* www/', { stdio: 'inherit' });
  console.log('✅ Arquivos copiados');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

// 4. Corrigir caminhos no index.html para Cordova
const indexPath = path.join(wwwDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Ajustar caminhos relativos
  indexContent = indexContent.replace(/href="\/([^"]*)"/, 'href="$1"');
  indexContent = indexContent.replace(/src="\/([^"]*)"/, 'src="$1"');
  
  // Adicionar script do Cordova
  indexContent = indexContent.replace(
    '<script type="module" src="/src/main.tsx"></script>',
    `<script src="cordova.js"></script>
    <script type="module" src="src/main.tsx"></script>`
  );
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ index.html ajustado para Cordova');
}

// 5. Criar diretórios de recursos se não existirem
const resDir = path.join(wwwDir, 'res');
if (!fs.existsSync(resDir)) {
  fs.mkdirSync(resDir, { recursive: true });
  fs.mkdirSync(path.join(resDir, 'icon', 'android'), { recursive: true });
  fs.mkdirSync(path.join(resDir, 'screen', 'android'), { recursive: true });
  console.log('✅ Diretórios de recursos criados');
}

console.log('🎉 Build do Cordova concluído!');
console.log('📱 Para gerar o APK:');
console.log('   1. cordova platform add android');
console.log('   2. cordova build android');
console.log('   3. cordova run android (para testar)');
