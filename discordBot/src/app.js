require('dotenv').config();
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const {isMatchStartedSoon, isMatchAlreadyPlayed} = require("./utils/utils");
const {schedule} = require("node-cron");
const {getMatchs} = require("./utils/apiRequest");
const config = require("./config/config.json");
const {createMatch, deleteChannels} = require("./utils/channelManagement");
const {InteractionCreate} = require("node:events");
const path = require("node:path");
const fs = require("node:fs");

const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const CRON_SCHEDULE = config.cronSchedule;

let guild;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on('ready', async () => {
    guild = client.guilds.cache.get(GUILD_ID);
    console.log('Guild:', guild.name);
    console.log(`Logged in as ${client.user.tag}!`);

    await schedule(CRON_SCHEDULE, async () => {

        try {
            const futuresMatchs = await getMatchs("future");

            for (const match of futuresMatchs) {
                if (match.matchDate && isMatchStartedSoon(match.matchDate)) {
                    await createMatch(match, guild);
                }else{
                    console.log('The match is not taking place soon');
                }
            }

            const pastMatchs = await getMatchs("past");

            for (const match of pastMatchs) {
                if (match.matchDate && isMatchAlreadyPlayed(match.matchDate)) {
                    await deleteChannels(match, guild);
                }else{
                    console.log('The match is not over/has not yet been played');
                }
            }

        } catch (error) {
            console.error('Error getting matchs:', error);
        }

    })
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(DISCORD_TOKEN);