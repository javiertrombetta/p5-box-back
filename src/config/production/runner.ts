import { execSync } from 'child_process';

console.log('Ejecutando el proceso de seed con datos de ejemplo...');
execSync('node dist/config/production/examples.js', { stdio: 'inherit' });

console.log('Iniciando la aplicación...');
execSync('node dist/main.js', { stdio: 'inherit' });
