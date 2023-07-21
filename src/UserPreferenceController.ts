// controllers/UserPreferenceController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { UserPreference } from '../models/UserPreference';

export class UserPreferenceController {
    static async getAllUserPreferences(req: Request, res: Response) {
        const userPreferenceRepository = getRepository(UserPreference);
        const userPreferences = await userPreferenceRepository.find();

        return res.json(userPreferences);
    }

    static async getUserPreference(req: Request, res: Response) {
        const { id } = req.params;
        const userPreferenceRepository = getRepository(UserPreference);
        const userPreference = await userPreferenceRepository.findOne(id);

        if (!userPreference) {
            return res.status(404).json({ message: 'User preference not found' });
        }

        return res.json(userPreference);
    }

    static async createUserPreference(req: Request, res: Response) {
        const { priceRange, location, isRent, roomsRange } = req.body;
        const userPreferenceRepository = getRepository(UserPreference);
        const userPreference = new UserPreference();

        userPreference.priceRange = priceRange;
        userPreference.location = location;
        userPreference.isRent = isRent;
        userPreference.roomsRange = roomsRange;

        const results = await userPreferenceRepository.save(userPreference);

        return res.status(201).json(results);
    }

    static async updateUserPreference(req: Request, res: Response) {
        const { id } = req.params;
        const { priceRange, location, isRent, roomsRange } = req.body;
        const userPreferenceRepository = getRepository(UserPreference);
        const userPreference = await userPreferenceRepository.findOne(id);

        if (!userPreference) {
            return res.status(404).json({ message: 'User preference not found' });
        }

        userPreference.priceRange = priceRange;
        userPreference.location = location;
        userPreference.isRent = isRent;
        userPreference.roomsRange = roomsRange;
        const results = await userPreferenceRepository.save(userPreference);

        return res.json(results);
    }

    static async deleteUserPreference(req: Request, res: Response) {
        const { id } = req.params;
        const userPreferenceRepository = getRepository(UserPreference);
        const userPreference = await userPreferenceRepository.findOne(id);

        if (!userPreference) {
            return res.status(404).json({ message: 'User preference not found' });
        }

        await userPreferenceRepository.remove(userPreference);

        return res.status(204).json({ message: 'User preference deleted' });
    }
}

