// server.ts
import express from 'express';
import { createConnection } from 'typeorm';
import userRoutes from './routes/userRoutes';
import userPreferenceRoutes from './routes/userPreferenceRoutes';
import listingRoutes from './routes/listingRoutes';

createConnection()
  .then(async () => {
    const app = express();

    app.use(express.json());

    app.use('/api', userRoutes);
    app.use('/api', userPreferenceRoutes);
    app.use('/api', listingRoutes);

    // Handle undefined routes
    app.use('*', (req, res) => {
      res.status(404).json({ message: 'Not found!' });
    });

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((error) => console.log(error));

