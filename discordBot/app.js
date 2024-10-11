require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const {getUsersFromTeam, getTeamsFromMatch, getMatchDivision, isInNextHour, matchAlreadyPlayed} = require("./utils");
const axios = require("axios");
const {schedule} = require("node-cron");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    await schedule('0-59 * * * *', async () => {

        console.log('Checking for matchs in next hour');
        await axios.get(process.env.API_URL + '/matchs')
            .then(response => {
                const matchsData = response.data;

                for (const match of matchsData) {

                    if (isInNextHour(match.matchDate)) {
                        matchManagement(match)
                    } else if(matchAlreadyPlayed(match)){
                        deleteChannels(match);
                    }else{
                        console.log('Match not in next hour');
                    }

                }
            })
            .catch(error => {
                console.error('Error getting matchs:', error);
            });


    })
});

const deleteChannels = async (match) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const division = getMatchDivision(match);
    const teams = getTeamsFromMatch(match);
    let category = guild.channels.cache.find(c => c.name === division && c.type === ChannelType.GuildCategory);

    for (const channel of guild.channels.cache.get(category.id).children.cache.values()) {
        if(teams.includes(channel.name)){
            console.log('Deleting channel:', channel.name, 'in category:', category.name);
            await guild.channels.delete(channel.id);
        }
    }
}

const matchManagement = async (match) => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const division = getMatchDivision(match);
    const teams = getTeamsFromMatch(match);

    let category = guild.channels.cache.find(c => c.name === division && c.type === ChannelType.GuildCategory);
    if (!category) {
        category = await guild.channels.create({
            name: division,
            type: ChannelType.GuildCategory
        })
        console.log(`Category created: ${category.name}`);
    }

    for (const team of teams) {
        const responseTeam = await axios.get(process.env.API_URL + '/teams?name=' + team)
            .catch(error => {
                console.error('Error getting team:', error);
            });

        const teamData = responseTeam.data[0];
        const users = getUsersFromTeam(teamData);

        try {
            const channel = await guild.channels.create({
                name: team,
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            })
            for (const user of users) {
                const discordUser = await guild.client.users.fetch(user);
                await channel.permissionOverwrites.edit(
                    discordUser,
                    {
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                );
            }
            console.log(`Voice channel created: ${channel.name} in category: ${category.name}`);
        } catch (error) {
            console.error('Error creating voice channel:', error);
        }
    }
}

//this line must be at the very end
client.login(process.env.DISCORD_TOKEN); //signs the bot in with token

