// routes/userRoutes.ts
import express from 'express';
import { UserController } from '../controllers/UserController';

const router = express.Router();

// Get all users
router.get('/users', UserController.getAllUsers);

// Get a single user
router.get('/users/:id', UserController.getUser);

// Create a new user
router.post('/users', UserController.createUser);

// Update an existing user
router.put('/users/:id', UserController.updateUser);

// Delete a user
router.delete('/users/:id', UserController.deleteUser);

export default router;

