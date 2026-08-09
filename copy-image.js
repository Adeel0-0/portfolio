const fs = require('fs');
const src = 'C:/Users/Windows/.gemini/antigravity/brain/9cc4fcd3-7a44-42ed-90ee-369d1f3d6c20/uploaded_image_1786037617425.jpg';
const dir = 'd:/job hunt/portfolio/public';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.copyFileSync(src, dir + '/profile.jpg');
console.log('COPIED', fs.statSync(dir + '/profile.jpg').size, 'bytes');
