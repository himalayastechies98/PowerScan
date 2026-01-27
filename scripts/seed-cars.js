import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedCars() {
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

        const cars = [];
        const models = ['Toyota Hilux', 'Ford Ranger', 'Chevrolet S10', 'Nissan Frontier', 'Mitsubishi L200', 'Volkswagen Amarok'];

        for (let i = 1; i <= 20; i++) {
            const idUnico = `CAR-${String(i).padStart(3, '0')}`;
            const name = `Inspection Vehicle ${i}`;
            const model = models[Math.floor(Math.random() * models.length)];
            const year = 2020 + Math.floor(Math.random() * 4); // 2020-2023
            // Generate random license plate ABC-1234 format
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            const plate =
                letters.charAt(Math.floor(Math.random() * 26)) +
                letters.charAt(Math.floor(Math.random() * 26)) +
                letters.charAt(Math.floor(Math.random() * 26)) +
                '-' +
                numbers.charAt(Math.floor(Math.random() * 10)) +
                numbers.charAt(Math.floor(Math.random() * 10)) +
                numbers.charAt(Math.floor(Math.random() * 10)) +
                numbers.charAt(Math.floor(Math.random() * 10));

            cars.push({
                id_unico: idUnico,
                name,
                model,
                year,
                license_plate: plate
            });
        }

        console.log('Seeding 20 cars...');

        // Clear existing cars to avoid duplicates if re-run
        await client.query('DELETE FROM cars');

        for (const car of cars) {
            const query = `
        INSERT INTO cars (id_unico, name, model, year, license_plate)
        VALUES ($1, $2, $3, $4, $5)
      `;
            const values = [car.id_unico, car.name, car.model, car.year, car.license_plate];
            await client.query(query, values);
        }

        console.log('\x1b[32m%s\x1b[0m', 'Successfully seeded 20 cars! 🚗');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding database:', err);
    } finally {
        await client.end();
    }
}

seedCars();
