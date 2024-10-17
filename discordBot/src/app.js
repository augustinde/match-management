require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {getUsersFromTeam, getMatchDivision, isInNextHour, matchAlreadyPlayed, getTeamNamesFromMatch,
    getHoursMinutesOfMatch
} = require("./utils/utils");
const {schedule} = require("node-cron");
const {getMatchs, getTeamByName} = require("./utils/apiRequest");
const {createChannel, addUserToChannel, getCategoryWithName, checkIfChannelExists} = require("./utils/discordIUtils");

const CRON_SCHEDULE = process.env.CRON_SCHEDULE;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

let guild;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', async () => {
    guild = client.guilds.cache.get(GUILD_ID);
    console.log('Guild:', guild.name);
    console.log(`Logged in as ${client.user.tag}!`);

    await schedule(CRON_SCHEDULE, async () => {

        try {
            const futuresMatchs = await getMatchs("future");

            for (const match of futuresMatchs) {
                if (isInNextHour(match.matchDate)) {
                    await createMatch(match)
                }else{
                    console.log('The match is not taking place soon');
                }
            }
        } catch (error) {
            console.error('Error getting matchs:', error);
        }

    })
});

const deleteChannels = async (match) => {
    const division = getMatchDivision(match);
    const teams = getTeamNamesFromMatch(match);
    let category = await getCategoryWithName(guild, division);

    if(category){
        for (const channel of guild.channels.cache.get(category.id).children.cache.values()) {
            if(teams.includes(channel.name)){
                console.log('Deleting channel:', channel.name, 'in category:', category.name);
                await guild.channels.delete(channel.id);
            }
        }
    }
}

const createMatch = async (match) => {

    const division = getMatchDivision(match);
    const teamNames = getTeamNamesFromMatch(match);

    let category = await getCategoryWithName(guild, division);
    for (const teamName of teamNames) {

        const team = await getTeamByName(teamName);
        const teamData = team[0];
        const users = getUsersFromTeam(teamData);
        const hoursMinutes = getHoursMinutesOfMatch(match.matchDate);
        const channelName = teamName + ' - ' + hoursMinutes;

        try {
            if(!checkIfChannelExists(guild, channelName)){
                const channel = await createChannel(teamName, category, guild, channelName);

                for (const user of users) {
                    const discordUser = await guild.client.users.fetch(user);
                    await addUserToChannel(channel, discordUser);
                }
            }else{
                console.log('Channel already exists:', channelName);
            }
        } catch (error) {
            console.error('Error creating voice channel:', error);
        }
    }
}

client.login(DISCORD_TOKEN);