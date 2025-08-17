import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = async (event) => {
  const authHeader = event.headers['authorization'];
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Authorization header missing' }),
    };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Token missing in Authorization header' }),
    };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'You are authenticated!', user }),
    };
  } catch (err) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Invalid or expired token' }),
    };
  }
};
