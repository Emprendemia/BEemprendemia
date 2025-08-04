import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB correctamente');
    app.listen(PORT, () => console.log(`🚀 Servidor escuchando en el puerto ${PORT}`));
  })
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));
