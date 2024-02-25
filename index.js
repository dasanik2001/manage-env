#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const dotenv = require('dotenv');
const { version } = require('./package.json'); // Import version from package.json

// Function to load environment variables from a specified file
function loadEnvFromFile(envFile) {
    if (!fs.existsSync(envFile)) {
        console.error(`Error: ${envFile} does not exist.`);
        console.log(`Creating ${envFile}...`);
        fs.writeFileSync(envFile, '');    }
    
    dotenv.config({ path: envFile });
}

// Function to add files to .gitignore
function addToGitIgnore(file) {
    const gitIgnoreFile = '.gitignore';
    if (fs.existsSync(gitIgnoreFile)) {
        const content = fs.readFileSync(gitIgnoreFile, 'utf-8');
        if (!content.includes(file)) {
            fs.appendFileSync(gitIgnoreFile, `\n${file}`);
            console.log(`Added '${file}' to .gitignore`);
        } else {
            console.log(`'${file}' already exists in .gitignore`);
        }
    } else {
        fs.writeFileSync(gitIgnoreFile, `${file}`);
        console.log(`Created .gitignore and added '${file}'`);
    }
}

// Define the command to set the environment file
program
    .command('use <envFile>')
    .description('Use a specific environment file')
    .action(envFile => {
        loadEnvFromFile(envFile);
        console.log(`Using environment file: ${envFile}`);
    });

// Define the command to get the value for a key
program
    .command('get <key>')
    .description('Get the value for a key')
    .action(key => {
        if (!process.env[key]) {
            console.error(`Error: Key '${key}' not found.`);
            process.exit(1);
        }
        console.log(process.env[key]);
    });

// Define the command to set the value for a key
program
    .command('set <key> <value>')
    .description('Set the value for a key')
    .action((key, value) => {
        if (!key || !value) {
            console.error("Error: Both key and value are required.");
            process.exit(1);
        }
        fs.appendFileSync('.env', `\n${key}=${value}`);
        addToGitIgnore('.env');
        console.log(`${key} set to ${value}`);
    });

// Define the command to create a backup of the .env file
program
    .command('backup')
    .description('Create a backup of the .env file')
    .action(() => {
        const envFile = '.env';
        const backupFile = `${envFile}.backup`;
        fs.copyFileSync(envFile, backupFile);
        addToGitIgnore(backupFile);
        console.log(`Backup created: ${backupFile}`);
    });

// Define the command to restore the .env file from a backup
program
    .command('restore')
    .description('Restore the .env file from a backup')
    .action(() => {
        const envFile = '.env';
        const backupFile = `${envFile}.backup`;
        if (!fs.existsSync(backupFile)) {
            console.error(`Error: No backup file found.`);
            process.exit(1);
        }
        fs.copyFileSync(backupFile, envFile);
        console.log(`Restored .env file from backup: ${backupFile}`);
    });

// Define a command to display the version of the CLI tool
program
    .version(version, '-v, --version', 'Display version'); // Use version from package.json

    
// Handle unknown commands
program.on('command:*', () => {
    console.error(`Error: Invalid command. Use '--help' for usage information.`);
    process.exit(1);
});

program.parse(process.argv);
