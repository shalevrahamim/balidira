// controllers/UserController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User';

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        const userRepository = getRepository(User);
        const users = await userRepository.find();

        return res.json(users);
    }

    static async getUser(req: Request, res: Response) {
        const { id } = req.params;
        const userRepository = getRepository(User);
        const user = await userRepository.findOne(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    }

    static async createUser(req: Request, res: Response) {
        const { userPreferences } = req.body;
        const userRepository = getRepository(User);
        const user = new User();

        user.userPreferences = userPreferences;

        const results = await userRepository.save(user);

        return res.status(201).json(results);
    }

    static async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const { userPreferences } = req.body;
        const userRepository = getRepository(User);
        const user = await userRepository.findOne(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.userPreferences = userPreferences;
        const results = await userRepository.save(user);

        return res.json(results);
    }

    static async deleteUser(req: Request, res: Response) {
        const { id } = req.params;
        const userRepository = getRepository(User);
        const user = await userRepository.findOne(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userRepository.remove(user);

        return res.status(204).json({ message: 'User deleted' });
    }
}

