import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedMethods() {
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

        const methods = [
            { name: 'Thermal Analysis', formula: 'ΔT = T_measured - T_ambient' },
            { name: 'Load Calculation', formula: 'P = V × I × √3 × cos(φ)' },
            { name: 'Efficiency Rating', formula: 'η = (P_out / P_in) × 100' },
            { name: 'Power Factor', formula: 'PF = cos(θ)' },
            { name: 'Voltage Drop', formula: 'V_drop = I × R × L' },
            { name: 'Resistance Calculation', formula: 'R = ρ × (L / A)' },
            { name: 'Current Density', formula: 'J = I / A' },
            { name: 'Power Loss', formula: 'P_loss = I² × R' },
            { name: 'Capacitive Reactance', formula: 'X_c = 1 / (2πfC)' },
            { name: 'Inductive Reactance', formula: 'X_l = 2πfL' },
            { name: 'Impedance', formula: 'Z = √(R² + X²)' },
            { name: 'Energy Consumption', formula: 'E = P × t' },
            { name: 'Apparent Power', formula: 'S = V × I' },
            { name: 'Reactive Power', formula: 'Q = V × I × sin(φ)' },
            { name: 'Active Power', formula: 'P = V × I × cos(φ)' },
        ];

        console.log(`Seeding ${methods.length} methods...`);

        // Clear existing methods to avoid duplicates if re-run
        await client.query('DELETE FROM methods');

        for (const method of methods) {
            const query = `
        INSERT INTO methods (name, formula)
        VALUES ($1, $2)
      `;
            const values = [method.name, method.formula];
            await client.query(query, values);
        }

        console.log('\x1b[32m%s\x1b[0m', `Successfully seeded ${methods.length} methods! 🧮`);

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding database:', err);
    } finally {
        await client.end();
    }
}

seedMethods();
