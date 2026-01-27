import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    red: '\x1b[31m',
};

function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        console.log(`\n${colors.blue}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.blue}${colors.bright}▶ Running: ${scriptName}${colors.reset}`);
        console.log(`${colors.blue}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        const scriptPath = path.join(__dirname, scriptName);
        const child = spawn('node', [scriptPath], {
            stdio: 'inherit',
            shell: true,
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${scriptName} exited with code ${code}`));
            } else {
                resolve();
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

async function seedAll() {
    console.log(`\n${colors.bright}${colors.green}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║                                                        ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║         🌱 SEEDING ALL DATABASE TABLES 🌱              ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║                                                        ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

    const scripts = [
        'seed-clients.js',
        'seed-cars.js',
        'seed-elements.js',
        'seed-lamps.js',
        'seed-actions.js',
    ];

    const startTime = Date.now();

    try {
        for (const script of scripts) {
            await runScript(script);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n${colors.bright}${colors.green}╔════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.green}║                                                        ║${colors.reset}`);
        console.log(`${colors.bright}${colors.green}║         ✅ ALL SEEDS COMPLETED SUCCESSFULLY! ✅         ║${colors.reset}`);
        console.log(`${colors.bright}${colors.green}║                                                        ║${colors.reset}`);
        console.log(`${colors.bright}${colors.green}║         Total time: ${duration}s                            ║${colors.reset}`);
        console.log(`${colors.bright}${colors.green}║                                                        ║${colors.reset}`);
        console.log(`${colors.bright}${colors.green}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

        console.log(`${colors.yellow}📊 Database is now populated with:${colors.reset}`);
        console.log(`   ${colors.green}✓${colors.reset} Client profiles (users)`);
        console.log(`   ${colors.green}✓${colors.reset} Cars (inspection vehicles)`);
        console.log(`   ${colors.green}✓${colors.reset} Elements (equipment/components)`);
        console.log(`   ${colors.green}✓${colors.reset} Lamps (lighting fixtures)`);
        console.log(`   ${colors.green}✓${colors.reset} Actions (maintenance tasks)\n`);

    } catch (err) {
        console.error(`\n${colors.red}${colors.bright}❌ Error during seeding:${colors.reset}`, err.message);
        process.exit(1);
    }
}

seedAll();
