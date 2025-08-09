#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Setting up HTTPS for camera testing...');

// Check if OpenSSL is available
const { execSync } = require('child_process');

try {
  // Create certificates directory if it doesn't exist
  const certDir = path.join(__dirname, 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  // Generate self-signed certificate
  const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;
  
  console.log('Generating self-signed certificate...');
  execSync(opensslCmd, { stdio: 'inherit' });
  
  console.log('✅ Certificate generated successfully!');
  console.log('📁 Certificate files:');
  console.log('   - Key:', keyPath);
  console.log('   - Certificate:', certPath);
  
  // Update vite.config.js to use HTTPS
  const viteConfigPath = path.join(__dirname, 'vite.config.js');
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Enable HTTPS in the config
  viteConfig = viteConfig.replace(
    'https: false,',
    `https: {
      key: fs.readFileSync('${keyPath}'),
      cert: fs.readFileSync('${certPath}')
    },`
  );
  
  // Add fs import if not present
  if (!viteConfig.includes("import fs from 'fs'")) {
    viteConfig = "import fs from 'fs'\n" + viteConfig;
  }
  
  fs.writeFileSync(viteConfigPath, viteConfig);
  
  console.log('✅ Vite configuration updated for HTTPS');
  console.log('🚀 Now run: npm run dev');
  console.log('📱 Access from mobile: https://YOUR_IP:5173 (accept the security warning)');
  
} catch (error) {
  console.error('❌ Error setting up HTTPS:', error.message);
  console.log('💡 Alternative solutions:');
  console.log('   1. Use ngrok: npx ngrok http 5173');
  console.log('   2. Use localtunnel: npx localtunnel --port 5173');
  console.log('   3. Test on localhost only');
}
