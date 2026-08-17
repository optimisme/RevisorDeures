import express from 'express';
import dotenv from 'dotenv';
import practiceRoutes from './routes/practice.routes';
import entregaRoutes from './routes/entrega.routes';
import practicaRoutes from './routes/practica.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/practices', practiceRoutes);
app.use('/api/entregues', entregaRoutes);
app.use('/api', practicaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RevisorDeures API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
