// routes/userPreferenceRoutes.ts
import express from 'express';
import { UserPreferenceController } from '../controllers/UserPreferenceController';

const router = express.Router();

// Get all user preferences
router.get('/userPreferences', UserPreferenceController.getAllUserPreferences);

// Get a single user preference
router.get('/userPreferences/:id', UserPreferenceController.getUserPreference);

// Create a new user preference
router.post('/userPreferences', UserPreferenceController.createUserPreference);

// Update an existing user preference
router.put('/userPreferences/:id', UserPreferenceController.updateUserPreference);

// Delete a user preference
router.delete('/userPreferences/:id', UserPreferenceController.deleteUserPreference);

export default router;

