
#!/bin/bash

echo "🚀 Instalando e configurando Cordova..."

# 1. Instalar Cordova globalmente (se necessário)
if ! command -v cordova &> /dev/null; then
    echo "📦 Instalando Cordova CLI..."
    npm install -g cordova
fi

# 2. Inicializar projeto Cordova (se não existir)
if [ ! -f "config.xml" ]; then
    echo "🔧 Inicializando projeto Cordova..."
    cordova create temp com.lovable.supraclientnexus "Supra Client Nexus"
    cp temp/config.xml .
    rm -rf temp
    echo "📋 Copiando configuração personalizada..."
    cp cordova-config.xml config.xml
fi

# 3. Fazer build do projeto ANTES de adicionar plataforma
echo "📦 Fazendo build..."
node build-cordova.js

# 4. Adicionar plataforma Android
echo "📱 Adicionando plataforma Android..."
cordova platform add android

# 5. Instalar plugins necessários
echo "🔌 Instalando plugins..."
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-network-information

echo "✅ Cordova configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. cordova build android"
echo "   2. cordova run android (para testar no dispositivo)"
echo ""
echo "📂 O APK será gerado em: platforms/android/app/build/outputs/apk/"
