require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {getUsersFromTeam, getMatchDivision, getTeamNamesFromMatch,
    getHoursMinutesOfMatch, isMatchStartedSoon, isMatchAlreadyPlayed
} = require("./utils/utils");
const {schedule} = require("node-cron");
const {getMatchs, getTeamByName} = require("./utils/apiRequest");
const {createChannel, addUserToChannel, getCategoryWithName, checkIfChannelExists, getChannelByName} = require("./utils/discordIUtils");
const config = require("./config/config.json");

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

client.on('ready', async () => {
    guild = client.guilds.cache.get(GUILD_ID);
    console.log('Guild:', guild.name);
    console.log(`Logged in as ${client.user.tag}!`);

    await schedule(CRON_SCHEDULE, async () => {

        try {
            const futuresMatchs = await getMatchs("future");

            for (const match of futuresMatchs) {
                if (isMatchStartedSoon(match.matchDate)) {
                    await createMatch(match)
                }else{
                    console.log('The match is not taking place soon');
                }
            }

            const pastMatchs = await getMatchs("past");

            for (const match of pastMatchs) {
                if (isMatchAlreadyPlayed(match)) {
                    await deleteChannels(match);
                }else{
                    console.log('The match is not over/has not yet been played');
                }
            }

        } catch (error) {
            console.error('Error getting matchs:', error);
        }

    })
});

const deleteChannels = async (match) => {
    const division = getMatchDivision(match);
    const teamNames = getTeamNamesFromMatch(match);
    let category = await getCategoryWithName(guild, division);

    const hoursMinutes = getHoursMinutesOfMatch(match.matchDate);

    for(const teamName of teamNames){
        const channelName = teamName + ' - ' + hoursMinutes;
        const channel = getChannelByName(guild, channelName);
        if(channel) {
            await guild.channels.delete(channel.id);
            console.log('Deleting channel:', channelName, 'in category:', category.name);
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