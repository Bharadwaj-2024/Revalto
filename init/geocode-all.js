/**
 * One-time migration script: Geocode all existing listings
 * that have [0, 0] coordinates (default / ungeocoded).
 * 
 * Usage: node init/geocode-all.js
 * 
 * Uses Nominatim (free, no API key needed).
 * Rate-limited to 1 request per second per Nominatim usage policy.
 */

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/test";

async function geocodeLocation(location, country) {
    try {
        const query = encodeURIComponent(`${location}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { "User-Agent": "Revalto/1.0 (geocode migration)" },
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                type: "Point",
                coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
            };
        }
        console.log(`  -> No results for "${location}, ${country}"`);
    } catch (err) {
        console.log(`  -> Geocoding error: ${err.message}`);
    }
    return null; // return null so we can skip instead of overwriting with [0,0]
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB\n");

    // Find all listings with default [0,0] coordinates or missing geometry
    const listings = await Listing.find({
        $or: [
            { "geometry.coordinates": [0, 0] },
            { geometry: { $exists: false } },
            { geometry: null },
        ],
    });

    console.log(`Found ${listings.length} listings to geocode.\n`);

    let success = 0;
    let failed = 0;

    for (const listing of listings) {
        console.log(`[${success + failed + 1}/${listings.length}] "${listing.title}" — ${listing.location}, ${listing.country}`);

        const geometry = await geocodeLocation(listing.location, listing.country);
        if (geometry) {
            listing.geometry = geometry;
            await listing.save();
            console.log(`  -> Geocoded: [${geometry.coordinates[0]}, ${geometry.coordinates[1]}]\n`);
            success++;
        } else {
            console.log(`  -> SKIPPED (could not geocode)\n`);
            failed++;
        }

        // Respect Nominatim rate limit: 1 request per second
        await sleep(1100);
    }

    console.log(`\nDone! Geocoded: ${success}, Failed: ${failed}, Total: ${listings.length}`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
