// open-swagger.js
require('dotenv').config();

const openModule = require('open'); // open() está en .default si estás en CommonJS
const open = openModule.default || openModule;

const PORT = process.env.PORT_SERVER || process.env.PORT || 3000;
const SWAGGER_PATH = 'docs';

console.log(`🌐 Abriendo Swagger en http://localhost:${PORT}/${SWAGGER_PATH}`);
open(`http://localhost:${PORT}/${SWAGGER_PATH}`);
