const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const tempApiDir = path.join(rootDir, 'src', 'app', '_api_temp');
const outDir = path.join(rootDir, 'out');

console.log('🚀 Preparing GitHub Pages static build...');

let renamed = false;
try {
  if (fs.existsSync(apiDir)) {
    console.log('📦 Temporarily shelving API routes for static export...');
    fs.renameSync(apiDir, tempApiDir);
    renamed = true;
  }

  console.log('⚡ Running next build with STATIC_EXPORT=true...');
  execSync('npx next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, STATIC_EXPORT: 'true' }
  });

  console.log('✨ Build finished. Creating .nojekyll in out/ ...');
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  console.log('✅ Static build successfully generated in "out" directory!');
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exitCode = 1;
} finally {
  if (renamed && fs.existsSync(tempApiDir)) {
    console.log('🔄 Restoring API routes...');
    fs.renameSync(tempApiDir, apiDir);
    console.log('✅ API routes restored.');
  }
}
