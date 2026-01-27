import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const mockActions = [
    { name: "Immediate Repair", priority: 1 },
    { name: "Schedule Inspection", priority: 2 },
    { name: "Monitor Status", priority: 3 },
    { name: "Replace Component", priority: 1 },
    { name: "Clean Equipment", priority: 4 },
    { name: "Urgent Maintenance", priority: 1 },
    { name: "Routine Check", priority: 5 },
    { name: "Safety Assessment", priority: 2 },
    { name: "Performance Test", priority: 3 },
    { name: "Component Upgrade", priority: 2 },
    { name: "Emergency Response", priority: 1 },
    { name: "Scheduled Replacement", priority: 3 },
    { name: "Quality Inspection", priority: 4 },
    { name: "System Calibration", priority: 3 },
    { name: "Preventive Maintenance", priority: 4 },
    { name: "Diagnostic Analysis", priority: 2 },
    { name: "Documentation Update", priority: 5 },
    { name: "Equipment Relocation", priority: 3 },
    { name: "Technical Assessment", priority: 2 },
    { name: "Compliance Audit", priority: 3 }
];

async function seedActions() {
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

        // Clear existing actions
        await client.query('DELETE FROM actions');
        console.log('Cleared existing actions.');

        console.log(`Seeding ${mockActions.length} actions...`);

        // Insert actions
        for (const action of mockActions) {
            await client.query(
                'INSERT INTO actions (name, priority) VALUES ($1, $2)',
                [action.name, action.priority]
            );
        }

        console.log(`\x1b[32mSuccessfully seeded ${mockActions.length} actions! 🎉\x1b[0m`);
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding actions:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedActions();
