const fs = require('fs');
const path = require('path');

const rootEnv = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(rootEnv)) {
  const targets = [
    path.resolve(__dirname, '..', 'packages', 'database', '.env'),
    path.resolve(__dirname, '..', 'apps', 'api', '.env'),
    path.resolve(__dirname, '..', 'apps', 'web', '.env')
  ];

  const content = fs.readFileSync(rootEnv, 'utf-8');

  targets.forEach((target) => {
    try {
      fs.writeFileSync(target, content, 'utf-8');
      console.log(`[sync-env] Synced .env to ${path.relative(path.resolve(__dirname, '..'), target)}`);
    } catch (err) {
      console.error(`[sync-env] Failed to sync ${target}:`, err.message);
    }
  });
} else {
  console.warn('[sync-env] Root .env not found.');
}
