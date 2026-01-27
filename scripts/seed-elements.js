import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

const mockElements = [
    { name: 'Capacitor', tag: 'BancoCapacitores', index: 0 },
    { name: 'Chave Óleo', tag: 'ChaveOleo', index: 1 },
    { name: 'Transformer', tag: 'Transformador', index: 2 },
    { name: 'Regulator', tag: 'Regulador', index: 3 },
    { name: 'Recloser', tag: 'Religador', index: 4 },
    { name: 'Circuit Breaker', tag: 'Disjuntor', index: 5 },
    { name: 'Disconnect Switch', tag: 'Seccionadora', index: 6 },
    { name: 'Current Transformer', tag: 'TC', index: 7 },
    { name: 'Voltage Transformer', tag: 'TP', index: 8 },
    { name: 'Surge Arrester', tag: 'ParaRaios', index: 9 },
    { name: 'Busbar', tag: 'Barramento', index: 10 },
    { name: 'Control Panel', tag: 'PainelControle', index: 11 },
    { name: 'Protection Relay', tag: 'ReleProtecao', index: 12 },
    { name: 'Meter', tag: 'Medidor', index: 13 },
    { name: 'Battery Bank', tag: 'BancoBaterias', index: 14 },
    { name: 'Inverter', tag: 'Inversor', index: 15 },
    { name: 'Generator', tag: 'Gerador', index: 16 },
    { name: 'Load Switch', tag: 'ChaveCarga', index: 17 },
    { name: 'Fuse', tag: 'Fusivel', index: 18 },
    { name: 'Cable Termination', tag: 'Terminacao', index: 19 },
];

async function seedElements() {
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

        // Clear existing elements
        await client.query('DELETE FROM elements');
        console.log('Cleared existing elements.');

        console.log(`Seeding ${mockElements.length} elements...`);

        // Insert elements
        for (const element of mockElements) {
            await client.query(
                'INSERT INTO elements (name, tag, index) VALUES ($1, $2, $3)',
                [element.name, element.tag, element.index]
            );
        }

        console.log(`\x1b[32mSuccessfully seeded ${mockElements.length} elements! 🎉\x1b[0m`);
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Error seeding elements:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedElements();
