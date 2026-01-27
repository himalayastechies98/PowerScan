import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const mockClients = [
    { email: 'john.doe@example.com', full_name: 'John Doe', role: 'client' },
    { email: 'jane.smith@example.com', full_name: 'Jane Smith', role: 'client' },
    { email: 'michael.johnson@example.com', full_name: 'Michael Johnson', role: 'client' },
    { email: 'emily.brown@example.com', full_name: 'Emily Brown', role: 'client' },
    { email: 'david.wilson@example.com', full_name: 'David Wilson', role: 'client' },
    { email: 'sarah.davis@example.com', full_name: 'Sarah Davis', role: 'admin' },
    { email: 'james.miller@example.com', full_name: 'James Miller', role: 'client' },
    { email: 'lisa.garcia@example.com', full_name: 'Lisa Garcia', role: 'client' },
    { email: 'robert.martinez@example.com', full_name: 'Robert Martinez', role: 'client' },
    { email: 'jennifer.rodriguez@example.com', full_name: 'Jennifer Rodriguez', role: 'client' },
    { email: 'william.hernandez@example.com', full_name: 'William Hernandez', role: 'client' },
    { email: 'mary.lopez@example.com', full_name: 'Mary Lopez', role: 'admin' },
    { email: 'thomas.gonzalez@example.com', full_name: 'Thomas Gonzalez', role: 'client' },
    { email: 'patricia.perez@example.com', full_name: 'Patricia Perez', role: 'client' },
    { email: 'charles.thompson@example.com', full_name: 'Charles Thompson', role: 'client' },
];

const DEFAULT_PASSWORD = 'client123';

async function seedClients() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local');
        console.log('\nPlease add the following to your .env.local file:');
        console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
        console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
        console.log('\nYou can find the service role key in:');
        console.log('Supabase Dashboard → Project Settings → API → service_role key');
        process.exit(1);
    }

    // Create Supabase Admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        console.log('Starting to seed client users...\n');

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const clientData of mockClients) {
            try {
                console.log(`Creating user: ${clientData.email}...`);

                // Create user in auth.users with Supabase Admin API
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: clientData.email,
                    password: DEFAULT_PASSWORD,
                    email_confirm: true, // Auto-confirm email
                    user_metadata: {
                        full_name: clientData.full_name,
                        role: clientData.role
                    }
                });

                if (authError) {
                    if (authError.message.includes('already registered')) {
                        console.log(`\x1b[33m  ⚠ User already exists, skipping...\x1b[0m`);
                        skippedCount++;
                    } else {
                        throw authError;
                    }
                } else {
                    console.log(`\x1b[32m  ✓ Created successfully\x1b[0m`);
                    createdCount++;
                }

            } catch (err) {
                console.error(`\x1b[31m  ✗ Error creating ${clientData.email}:\x1b[0m`, err.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\x1b[32m%s\x1b[0m', '✅ Client seeding completed!');
        console.log('='.repeat(60));
        console.log(`\x1b[32m✓ Created: ${createdCount} users\x1b[0m`);
        if (skippedCount > 0) {
            console.log(`\x1b[33m⚠ Skipped: ${skippedCount} users (already exist)\x1b[0m`);
        }
        if (errorCount > 0) {
            console.log(`\x1b[31m✗ Errors: ${errorCount} users\x1b[0m`);
        }
        console.log('\n📋 Login Credentials:');
        console.log(`   Email: Any of the seeded emails above`);
        console.log(`   Password: ${DEFAULT_PASSWORD}`);
        console.log('='.repeat(60) + '\n');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Fatal error seeding clients:', err);
        process.exit(1);
    }
}

seedClients();
