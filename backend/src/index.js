import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('This is a Test');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});
