import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { connectDB } from './database';

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});
