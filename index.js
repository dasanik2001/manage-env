#!/usr/bin/env node

const fs = require("fs");
const { program } = require("commander");
const dotenv = require("dotenv");
const { version } = require("./package.json"); 
const inquirer = require("inquirer");
const CONFIG_FILE = 'config.json';


// Function to create environment variables from a specified file name
function createEnvFromFile(envFile) {
  if (fs.existsSync(envFile)) {
    console.error(`Error: ${envFile} already exists.`);
  } else {
    console.log(`Creating ${envFile}...`);
    fs.writeFileSync(envFile, "");
  }
  
}
function addOrUpdateKeyValue(key, value, envFile) {
    const envData = dotenv.parse(fs.readFileSync(envFile));
    envData[key] = value;
    const newData = Object.entries(envData).map(([key, value]) => `${key}=${value}`).join('\n');
    fs.writeFileSync(envFile, newData);
}




// Function to prompt user to choose from multiple .env files
function chooseEnvFile(envFiles) {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedEnv",
      message: "Select an environment file:",
      choices: envFiles,
    },
  ]);
}

// Function to save the selected .env file to the configuration file
function saveSelectedEnvFile(selectedEnvFile) {
    const config = { selectedEnvFile };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Function to get the selected .env file from the configuration file
function getSelectedEnvFile() {
    if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE));
        return config.selectedEnvFile;
    }
    return null;
}

// Function to add files to .gitignore
function addToGitIgnore(file) {
  const gitIgnoreFile = ".gitignore";
  if (fs.existsSync(gitIgnoreFile)) {
    const content = fs.readFileSync(gitIgnoreFile, "utf-8");
    if (!content.includes(file)) {
      fs.appendFileSync(gitIgnoreFile, `${file}\n`);
      console.log(`Added '${file}' to .gitignore`);
    } 
  } else {
    fs.writeFileSync(gitIgnoreFile, `${file}`);
    console.log(`Created .gitignore and added '${file}'`);
  }
}

// Define the command to set the environment file
program
  .command("create <envFile>")
  .description("Create a specific environment file")
  .action((envFile) => {
    createEnvFromFile(envFile);
    console.log(`New environment file created: ${envFile}`);
  });

program
  .command("select")
  .description("Use a specific environment file")
  .action(async (envFile) => {
    const envFiles = fs
      .readdirSync(process.cwd())
      .filter((file) => file.startsWith(".env"));
    if (envFiles.length === 0) {
      console.error("Error: No .env files found in the current directory.");
      process.exit(1);
    }
    if (envFile) {
      if (envFiles.length === 1) {
        envFile = envFiles[0];
      } else {
        const { selectedEnv } = await chooseEnvFile(envFiles);
        envFile = selectedEnv;
      }
    }
    saveSelectedEnvFile(envFile);
    dotenv.config({ path: envFile });
    console.log(`Using environment file: ${envFile}`);
  });


// Define the command to get the value for a key
program
  .command("get <key>")
  .description("Get the value for a key")
  .action((key) => {
    const selectedEnvFile = getSelectedEnvFile();
    dotenv.config({ path: selectedEnvFile });
    if (!process.env[key]) {
      console.error(`Error: Key '${key}' not found.`);
      process.exit(1);
    }
    console.log(process.env[key]);
  });

// Define the command to set the value for a key
program
  .command("set <key> <value>")
  .description("Set the value for a key")
  .action((key, value) => {
    if (!key || !value) {
      console.error("Error: Both key and value are required.");
      process.exit(1);
    }
    const selectedEnvFile = getSelectedEnvFile();
    if (!selectedEnvFile) {
            console.error('Error: No environment file selected. Please use the "use" command to select an environment file.');
            process.exit(1);
        }

        const envData = dotenv.parse(fs.readFileSync(selectedEnvFile));
        if (envData[key]) {
            console.log(`Key '${key}' already exists. Updating its value.`);
        }
        
        addOrUpdateKeyValue(key, value, selectedEnvFile);
        console.log(`${key} set to ${value}`);
    addToGitIgnore(selectedEnvFile);
  });

// Define the command to create a backup of the .env file --- Updation in progress
program
  .command("backup")
  .description("Create a backup of the .env file")
  .action(() => {
    const envFile = ".env";
    const backupFile = `${envFile}.backup`;
    fs.copyFileSync(envFile, backupFile);
    addToGitIgnore(backupFile);
    console.log(`Backup created: ${backupFile}`);
  });

// Define the command to restore the .env file from a backup -- Updation in progress
program
  .command("restore")
  .description("Restore the .env file from a backup")
  .action(() => {
    const envFile = ".env";
    const backupFile = `${envFile}.backup`;
    if (!fs.existsSync(backupFile)) {
      console.error(`Error: No backup file found.`);
      process.exit(1);
    }
    fs.copyFileSync(backupFile, envFile);
    console.log(`Restored .env file from backup: ${backupFile}`);
  });

// Define a command to display the version of the CLI tool
program.version(version, "-v, --version", "Display version"); // Use version from package.json

// Handle unknown commands
program.on("command:*", () => {
  console.error(`Error: Invalid command. Use '--help' for usage information.`);
  process.exit(1);
});

program.parse(process.argv);
