import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedAlarms() {
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

        // First, fetch some elements, actions, and methods to create relations
        console.log('Fetching elements, actions, and methods...');

        const { rows: elements } = await client.query('SELECT id, name FROM elements LIMIT 5');
        const { rows: actions } = await client.query('SELECT id, name FROM actions LIMIT 5');
        const { rows: methods } = await client.query('SELECT id, name FROM methods LIMIT 5');

        if (elements.length === 0 || actions.length === 0 || methods.length === 0) {
            console.error('\x1b[31m%s\x1b[0m', 'Error: Please seed elements, actions, and methods first!');
            console.log('Run: npm run db:seed:elements && npm run db:seed:actions && npm run db:seed:methods');
            process.exit(1);
        }

        const alarmTemplates = [
            { name: 'High Temperature Alert', min: 50, max: 85 },
            { name: 'Overload Warning', min: 60, max: 90 },
            { name: 'Critical Heat Threshold', min: 45, max: 80 },
            { name: 'Efficiency Drop Alert', min: 55, max: 88 },
            { name: 'Power Factor Warning', min: 40, max: 75 },
            { name: 'Voltage Spike Alert', min: 220, max: 240 },
            { name: 'Current Overload', min: 100, max: 150 },
            { name: 'Phase Imbalance Warning', min: 5, max: 10 },
            { name: 'Insulation Degradation', min: 30, max: 70 },
            { name: 'Oil Temperature Alert', min: 55, max: 95 },
        ];

        console.log('Seeding alarms...');

        // Clear existing alarms to avoid duplicates if re-run
        await client.query('DELETE FROM alarms');

        let count = 0;
        for (const template of alarmTemplates) {
            // Randomly select element, action, and method
            const element = elements[Math.floor(Math.random() * elements.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const method = methods[Math.floor(Math.random() * methods.length)];

            const query = `
                INSERT INTO alarms (name, element_id, action_id, method_id, min_value, max_value)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [
                template.name,
                element.id,
                action.id,
                method.id,
                template.min,
                template.max
            ];

            await client.query(query, values);
            count++;
        }

        console.log('\x1b[32m%s\x1b[0m', `Successfully seeded ${count} alarms! 🔔`);

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding database:', err);
    } finally {
        await client.end();
    }
}

seedAlarms();
