// routes/listingRoutes.ts
import express from 'express';
import { ListingController } from '../controllers/ListingController';

const router = express.Router();

// Get all listings
router.get('/listings', ListingController.getAllListings);

// Get a single listing
router.get('/listings/:id', ListingController.getListing);

// Create a new listing
router.post('/listings', ListingController.createListing);

// Update an existing listing
router.put('/listings/:id', ListingController.updateListing);

// Delete a listing
router.delete('/listings/:id', ListingController.deleteListing);

export default router;

