import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const mockLamps = [
    { name: "LED Street Lamp 100W" },
    { name: "Sodium Vapor Lamp 150W" },
    { name: "Metal Halide Lamp 250W" },
    { name: "LED Floodlight 200W" },
    { name: "Compact Fluorescent 50W" },
    { name: "High Pressure Sodium 400W" },
    { name: "Mercury Vapor 175W" },
    { name: "Induction Lamp 80W" },
    { name: "LED High Bay 150W" },
    { name: "Solar Street Light 60W" },
    { name: "Ceramic Metal Halide 70W" },
    { name: "Halogen Floodlight 500W" },
    { name: "LED Tunnel Light 120W" },
    { name: "Low Pressure Sodium 90W" },
    { name: "LED Garden Light 30W" },
    { name: "Smart LED Pole 100W" },
    { name: "Industrial LED Strip 40W" },
    { name: "Explosion Proof LED 80W" },
    { name: "Stadium Floodlight 1000W" },
    { name: "Decorative Post Top 60W" }
];

async function seedLamps() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        // Clear existing lamps
        await client.query('DELETE FROM lamps');
        console.log('Cleared existing lamps.');

        console.log(`Seeding ${mockLamps.length} lamps...`);

        // Insert lamps
        for (const lamp of mockLamps) {
            await client.query(
                'INSERT INTO lamps (name) VALUES ($1)',
                [lamp.name]
            );
        }

        console.log(`\x1b[32mSuccessfully seeded ${mockLamps.length} lamps! 🎉\x1b[0m`);
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding lamps:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedLamps();
