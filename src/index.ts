import express from 'express';
import dotenv from 'dotenv';
import practiceRoutes from './routes/practice.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', practiceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RevisorDeures API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
