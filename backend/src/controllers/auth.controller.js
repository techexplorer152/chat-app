import { createUser, findUserByEmail, hashPassword, comparePassword, generateToken } from '../services/auth.service.js';

export async function register(req, res) {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'User already exists.' });

        const hashedPassword = await hashPassword(password);
        const newUser = await createUser({ email, username, password: hashedPassword });

        const { password: _, ...userData } = newUser;
        res.status(201).json({ message: 'User registered.', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: 'User does not exist.' });

        const valid = await comparePassword(password, user.password);
        if (!valid) return res.status(400).json({ message: 'Invalid credentials.' });

        const token = generateToken(user);
        const { password: _, ...userData } = user;

        res.status(200).json({ message: 'Login successful.', token, user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
}
