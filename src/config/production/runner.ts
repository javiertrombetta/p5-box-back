import { execSync } from 'child_process';

console.log('Ejecutando el proceso de seed...');
execSync('node dist/seed.js', { stdio: 'inherit' });

console.log('Iniciando la aplicación...');
execSync('node dist/main.js', { stdio: 'inherit' });
