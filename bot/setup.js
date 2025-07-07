#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Настройка проекта Telegram VEO 3 Bot...\n');

// Создаем необходимые папки
const directories = [
  'logs',
  'temp',
  'uploads',
  'src/services',
  'src/middleware',
  'src/config'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dir}`);
  } else {
    console.log(`ℹ️  Папка уже существует: ${dir}`);
  }
});

// Создаем .gitignore если его нет
const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  const gitignoreContent = `# Dependencies
node_modules/

# Environment variables
.env

# Logs
logs/
*.log

# Temporary files
temp/
uploads/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Runtime files
*.pid
*.seed

# Coverage
coverage/

# Build output
dist/
build/
`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ Создан .gitignore файл');
} else {
  console.log('ℹ️  .gitignore уже существует');
}

// Проверяем существование package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json не найден! Создайте его с помощью npm init');
} else {
  console.log('✅ package.json найден');
}

// Проверяем существование .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env файл не найден! Скопируйте env.example в .env и настройте переменные');
} else {
  console.log('✅ .env файл найден');
}

console.log('\n🎉 Настройка завершена!\n');
console.log('📋 Следующие шаги:');
console.log('1. Убедитесь, что все зависимости установлены: npm install');
console.log('2. Настройте переменные окружения в .env файле');
console.log('3. Создайте базу данных в Supabase');
console.log('4. Запустите бота: npm run dev');
console.log('\nПодробные инструкции смотрите в QUICK_START.md'); 