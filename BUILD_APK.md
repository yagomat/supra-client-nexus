
# 📱 Como Gerar o APK usando GitHub Actions

Este projeto está configurado para gerar automaticamente o APK do aplicativo Android usando GitHub Actions.

## 🚀 Como usar:

### 1. Primeiro upload (apenas uma vez):
1. **Exporte para GitHub**: Use o botão "Export to Github" no Lovable
2. **Clone o repositório**: `git clone [seu-repo]`
3. **Faça push**: Os arquivos de configuração já estão incluídos

### 2. Build automático:
- **Automático**: A cada push na branch `main` ou `master`
- **Manual**: Vá em Actions → "Build Android APK" → "Run workflow"

### 3. Download do APK:
1. Vá na aba **Actions** do seu repositório
2. Clique no workflow mais recente
3. Baixe o arquivo em **Artifacts** → `android-apk`
4. **OU** baixe da seção **Releases** (APK numerado automaticamente)

## 📋 O que o workflow faz:

✅ **Configuração completa do ambiente**:
- Node.js 18
- Java JDK 17  
- Android SDK
- Cordova CLI

✅ **Build otimizado**:
- Instala todas as dependências
- Compila o projeto React/Vite
- Configura estrutura Cordova
- Adiciona plugins necessários

✅ **Funcionalidades preservadas**:
- Overlay no WhatsApp (permissões incluídas)
- Detecção automática de clientes
- Todas as APIs nativas
- Permissões de acessibilidade

✅ **APK final**:
- Arquivo: `supra-client-nexus-v[número].apk`
- Pronto para instalar no Android
- Todas as funcionalidades funcionando

## 🔧 Personalização:

### Alterar informações do app:
Edite o arquivo `cordova-config.xml`:
- `<name>`: Nome do aplicativo
- `<description>`: Descrição
- `<author>`: Suas informações

### Adicionar plugins:
No arquivo `.github/workflows/build-android.yml`, seção "Install Cordova plugins":
```bash
cordova plugin add [nome-do-plugin]
```

### Modificar permissões:
No arquivo `cordova-config.xml`, seção `<uses-permission>`.

## 📱 Instalação no Android:

1. **Baixe o APK** gerado
2. **Ative fontes desconhecidas**:
   - Configurações → Segurança → Fontes desconhecidas
3. **Instale o APK**
4. **Conceda permissões**:
   - Sobreposição na tela
   - Acessibilidade
   - Acesso à rede

## 🎯 Vantagens desta solução:

- ✅ **100% gratuito** (GitHub Actions gratuito para repos públicos)
- ✅ **Todas as funcionalidades** preservadas
- ✅ **Build automático** a cada atualização
- ✅ **Controle total** sobre plugins e permissões
- ✅ **APK assinado** e pronto para distribuição

## 🐛 Problemas comuns:

### Build falha:
- Verifique os logs em Actions
- Ensure que `package.json` está correto
- Verifique se `cordova-config.xml` está válido

### APK não instala:
- Verifique se ativou "Fontes desconhecidas"
- Use um arquivo manager para instalar
- Verifique se o dispositivo tem espaço

### Funcionalidades não funcionam:
- Conceda todas as permissões solicitadas
- Ative acessibilidade nas configurações
- Permita sobreposição na tela

---

**🎉 Pronto!** Agora você tem um sistema automatizado para gerar APKs com todas as funcionalidades do seu aplicativo!
