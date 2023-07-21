// db.ts
import { createConnection } from 'typeorm';
import { User } from './models/User';
import { UserPreference } from './models/UserPreference';
import { Listing } from './models/Listing';

createConnection({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test',
  entities: [User, UserPreference, Listing],
  synchronize: true,
}).then(() => {
  console.log('Database connected');
}).catch(error => console.log('Error: ', error));

