import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  modules: [
    {
      title: String,
      time: String
    }
  ],
  hours: Number,
  videoUrl: String,
  image: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: {
    type: String,
    enum: [
      'Redes sociales y publicidad',
      'Educación financiera',
      'Gestión y E-commerce',
      'Packaging',
      'Envios y logística',
      'Mentalidad emprendedora',
      'Atención al Cliente y Post-Venta'
    ],
    required: true
  },
  state: {
    type: String,
    enum: ['in_review', 'published', 'inactive'],
    default: 'in_review'
  }
}, { timestamps: true });


export const Course = mongoose.model('Course', courseSchema);
