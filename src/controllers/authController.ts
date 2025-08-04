import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------------------- REGISTER --------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
  expiresIn: '7d'
});


  res.json({ token, role:user.role });
};

// -------------------- GOOGLE LOGIN --------------------
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token no proporcionado' });

    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const profile = await googleRes.json();
    const { email, name } = profile;

    if (!email || !name) {
      return res.status(400).json({ message: 'Datos inválidos desde Google' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        fullname: name,
        email,
        password: 'google_oauth',
        role: 'user' // podés cambiar a 'teacher' si lo necesitás
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token: jwtToken, role: user.role });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({ message: 'Error al iniciar sesión con Google' });
  }
};


//--------------------CONTROLLERS DEL PROFILE-------------------------------

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).select('fullname email password');
  res.json(user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { fullname, email } = req.body;
  const user = await User.findByIdAndUpdate((req as any).user.id, { fullname, email }, { new: true });
  res.json({ message: 'Perfil actualizado', user });
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById((req as any).user.id);

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ message: 'Contraseña actual incorrecta' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  res.json({ message: 'Contraseña actualizada' });
};

