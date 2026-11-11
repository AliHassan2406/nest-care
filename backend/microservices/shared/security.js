import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './env.js';
import { readCollection } from './storage.js';

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = readCollection('users.json', []).find((item) => item.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid. Please sign in again.' });
    req.user = publicUser(user);
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    return next();
  };
}

export function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}
