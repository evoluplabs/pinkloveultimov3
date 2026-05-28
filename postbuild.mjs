import { copyFileSync } from 'fs'

// Renomeia o worker para o nome esperado pelo Cloudflare Pages.
// Nitro cloudflare-pages preset gera dist/index.js, mas CF Pages exige _worker.js.
copyFileSync('dist/index.js', 'dist/_worker.js')
console.log('✅ dist/index.js → dist/_worker.js')