// import jwt, { SignOptions } from 'jsonwebtoken';

// const SECRET = process.env.JWT_SECRET as string;

// export const signJWT = (
//     payload: object,
//     expiresIn: SignOptions['expiresIn'] = '1d'
// ): string => {
//     const options: SignOptions = { expiresIn };
//     return jwt.sign(payload, SECRET, options);
// };

// export const verifyJWT = (token: string): any => {
//     try {
//         return jwt.verify(token, SECRET);
//     } catch (err) {
//         return null;
//     }
// };
