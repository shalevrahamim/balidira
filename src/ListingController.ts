// controllers/ListingController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Listing } from '../models/Listing';

export class ListingController {
    static async getAllListings(req: Request, res: Response) {
        const listingRepository = getRepository(Listing);
        const listings = await listingRepository.find();

        return res.json(listings);
    }

    static async getListing(req: Request, res: Response) {
        const { id } = req.params;
        const listingRepository = getRepository(Listing);
        const listing = await listingRepository.findOne(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        return res.json(listing);
    }

    static async createListing(req: Request, res: Response) {
        const { isRent, apartmentDetails, price, location, isPushed } = req.body;
        const listingRepository = getRepository(Listing);
        const listing = new Listing();

        listing.isRent = isRent;
        listing.apartmentDetails = apartmentDetails;
        listing.price = price;
        listing.location = location;
        listing.isPushed = isPushed;

        const results = await listingRepository.save(listing);

        return res.status(201).json(results);
    }

    static async updateListing(req: Request, res: Response) {
        const { id } = req.params;
        const { isRent, apartmentDetails, price, location, isPushed } = req.body;
        const listingRepository = getRepository(Listing);
        const listing = await listingRepository.findOne(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        listing.isRent = isRent;
        listing.apartmentDetails = apartmentDetails;
        listing.price = price;
        listing.location = location;
        listing.isPushed = isPushed;
        const results = await listingRepository.save(listing);

        return res.json(results);
    }

    static async deleteListing(req: Request, res: Response) {
        const { id } = req.params;
        const listingRepository = getRepository(Listing);
        const listing = await listingRepository.findOne(id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        await listingRepository.remove(listing);

        return res.status(204).json({ message: 'Listing deleted' });
    }
}

