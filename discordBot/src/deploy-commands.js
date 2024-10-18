require('dotenv').config();
const path = require("node:path");
const fs = require("node:fs");
const { REST, Routes } = require('discord.js');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const APP_ID = process.env.APP_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for(const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if('data' in command && 'execute' in command){
            commands.push(command.data.toJSON());
        }else{
            console.error(`Error loading ${file}`);
        }
    }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(APP_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();