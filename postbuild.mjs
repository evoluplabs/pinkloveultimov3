import { copyFileSync, cpSync, mkdirSync } from 'fs'

// 1. Copia o worker SSR para onde o Cloudflare Pages espera
copyFileSync('dist/server/index.js', 'dist/_worker.js')
console.log('✅ _worker.js copiado para dist/')

// 2. Move os assets de dist/client/ para dist/ (path correto para CF Pages)
cpSync('dist/client/', 'dist/', { recursive: true })
console.log('✅ Assets movidos de dist/client/ para dist/')