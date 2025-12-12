// entry.js (ใหม่ - ES Modules)

import * as dotenv from 'dotenv';
import { pathToFileURL } from 'url';

// 1. โหลด .env ก่อน
dotenv.config(); 

// 2. รัน Nuxt Server (ใช้ dynamic import และใช้ pathToFileURL เพื่อให้ path ทำงานได้ถูกต้องใน ESM)
// pathToFileURL(path) จะช่วยแปลง path ที่เป็น string ให้เป็น URL object ที่ import สามารถใช้ได้
import(pathToFileURL('./.output/server/index.mjs').toString());