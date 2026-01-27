import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedInspections() {
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

        // Get first 2 feeders
        const feedersResult = await client.query(
            'SELECT id_unico FROM feeders ORDER BY created_at LIMIT 2'
        );

        // Get first 2 cars
        const carsResult = await client.query(
            'SELECT id_unico FROM cars ORDER BY created_at LIMIT 2'
        );

        if (feedersResult.rows.length < 2) {
            console.error('\x1b[31m%s\x1b[0m', 'Error: Need at least 2 feeders in database. Run "node scripts/setup-feeders.js" first.');
            process.exit(1);
        }

        if (carsResult.rows.length < 2) {
            console.error('\x1b[31m%s\x1b[0m', 'Error: Need at least 2 cars in database. Run "node scripts/seed-cars.js" first.');
            process.exit(1);
        }

        const feeders = feedersResult.rows.map(r => r.id_unico);
        const cars = carsResult.rows.map(r => r.id_unico);

        const inspections = [
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014237',
                feeder_id: feeders[0],
                car_id: cars[0],
                status: 'Finalizada',
                measures_red: 5,
                measures_yellow: 97,
                inspection_type: 'Thermo-T',
                last_measure_date: '2025-10-28'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014238',
                feeder_id: feeders[1],
                car_id: cars[1],
                status: 'En Progreso',
                measures_red: 12,
                measures_yellow: 45,
                inspection_type: 'Visual',
                last_measure_date: '2025-10-29'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014239',
                feeder_id: feeders[0],
                car_id: cars[0],
                status: 'Finalizada',
                measures_red: 3,
                measures_yellow: 120,
                inspection_type: 'Thermo-T',
                last_measure_date: '2025-10-27'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014240',
                feeder_id: feeders[1],
                car_id: cars[1],
                status: 'Pendiente',
                measures_red: 8,
                measures_yellow: 67,
                inspection_type: 'Híbrido',
                last_measure_date: '2025-10-26'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014241',
                feeder_id: feeders[0],
                car_id: cars[0],
                status: 'Finalizada',
                measures_red: 2,
                measures_yellow: 89,
                inspection_type: 'Visual',
                last_measure_date: '2025-10-30'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014242',
                feeder_id: feeders[1],
                car_id: cars[1],
                status: 'En Progreso',
                measures_red: 15,
                measures_yellow: 34,
                inspection_type: 'Thermo-T',
                last_measure_date: '2025-10-25'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014243',
                feeder_id: feeders[0],
                car_id: cars[0],
                status: 'Finalizada',
                measures_red: 1,
                measures_yellow: 156,
                inspection_type: 'Visual',
                last_measure_date: '2025-10-24'
            },
            {
                name: '2025 EMT - RSI',
                ea: 'RSI_088009_2014244',
                feeder_id: feeders[1],
                car_id: cars[1],
                status: 'Finalizada',
                measures_red: 7,
                measures_yellow: 78,
                inspection_type: 'Thermo-T',
                last_measure_date: '2025-10-23'
            }
        ];

        console.log('Seeding inspections...');

        // Clear existing inspections to avoid duplicates if re-run
        await client.query('DELETE FROM inspections');

        for (const inspection of inspections) {
            const query = `
        INSERT INTO inspections (
          name, ea, feeder_id, car_id, status, 
          measures_red, measures_yellow, inspection_type, last_measure_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
            const values = [
                inspection.name,
                inspection.ea,
                inspection.feeder_id,
                inspection.car_id,
                inspection.status,
                inspection.measures_red,
                inspection.measures_yellow,
                inspection.inspection_type,
                inspection.last_measure_date
            ];
            await client.query(query, values);
        }

        console.log('\x1b[32m%s\x1b[0m', `Successfully seeded ${inspections.length} inspections! 📊`);

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding database:', err);
    } finally {
        await client.end();
    }
}

seedInspections();
