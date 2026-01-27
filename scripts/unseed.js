import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function unseedDatabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    // Create Supabase Admin client if credentials are available
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
        supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
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

        console.log('\x1b[33m%s\x1b[0m', '⚠️  Starting to undo all seeds...');

        // Get counts before deletion
        const carsCountResult = await client.query('SELECT COUNT(*) FROM cars');
        const elementsCountResult = await client.query('SELECT COUNT(*) FROM elements');
        const lampsCountResult = await client.query('SELECT COUNT(*) FROM lamps');
        const actionsCountResult = await client.query('SELECT COUNT(*) FROM actions');
        const profilesCountResult = await client.query('SELECT COUNT(*) FROM profiles');

        const carsCount = parseInt(carsCountResult.rows[0].count);
        const elementsCount = parseInt(elementsCountResult.rows[0].count);
        const lampsCount = parseInt(lampsCountResult.rows[0].count);
        const actionsCount = parseInt(actionsCountResult.rows[0].count);
        const profilesCount = parseInt(profilesCountResult.rows[0].count);

        console.log(`\nFound ${profilesCount} clients, ${carsCount} cars, ${elementsCount} elements, ${lampsCount} lamps, and ${actionsCount} actions to remove.`);

        if (carsCount === 0 && elementsCount === 0 && lampsCount === 0 && actionsCount === 0 && profilesCount === 0) {
            console.log('\x1b[33m%s\x1b[0m', '\n✓ Database is already empty. Nothing to unseed.');
            return;
        }

        // Delete cars
        if (carsCount > 0) {
            console.log('\nDeleting cars...');
            await client.query('DELETE FROM cars');
            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${carsCount} cars`);
        }

        // Delete elements
        if (elementsCount > 0) {
            console.log('Deleting elements...');
            await client.query('DELETE FROM elements');
            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${elementsCount} elements`);
        }

        // Delete lamps
        if (lampsCount > 0) {
            console.log('Deleting lamps...');
            await client.query('DELETE FROM lamps');
            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${lampsCount} lamps`);
        }

        // Delete actions
        if (actionsCount > 0) {
            console.log('Deleting actions...');
            await client.query('DELETE FROM actions');
            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${actionsCount} actions`);
        }

        // Delete auth users and profiles
        if (profilesCount > 0 && supabase) {
            console.log('Deleting authentication users and profiles...');

            // Get all profile IDs
            const profilesResult = await client.query('SELECT id, email FROM profiles');
            const profiles = profilesResult.rows;

            let deletedAuthCount = 0;
            for (const profile of profiles) {
                try {
                    // Delete from auth.users using Supabase Admin API
                    const { error } = await supabase.auth.admin.deleteUser(profile.id);
                    if (!error) {
                        deletedAuthCount++;
                    }
                } catch (err) {
                    // Continue even if auth deletion fails
                    console.log(`  Warning: Could not delete auth user ${profile.email}`);
                }
            }

            // Delete remaining profiles (should be auto-deleted by cascade, but just in case)
            await client.query('DELETE FROM profiles');

            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${deletedAuthCount} auth users and ${profilesCount} profiles`);
        } else if (profilesCount > 0) {
            // Just delete profiles if no Supabase admin access
            console.log('Deleting client profiles...');
            await client.query('DELETE FROM profiles');
            console.log('\x1b[32m%s\x1b[0m', `✓ Deleted ${profilesCount} client profiles`);
            console.log('\x1b[33m%s\x1b[0m', '⚠️  Note: Auth users not deleted (Supabase credentials not available)');
        }

        console.log('\n\x1b[32m%s\x1b[0m', '✅ Successfully undone all seeds! Database is now empty. 🧹');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', '\n❌ Error unseeding database:', err);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\nDatabase connection closed.');
    }
}

unseedDatabase();
