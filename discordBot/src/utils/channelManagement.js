const {getMatchDivision, getTeamNamesFromMatch, getHoursMinutesOfMatch, getUsersFromTeam} = require("./utils");
const {
    getCategoryWithName,
    getChannelByName,
    checkIfChannelExists,
    createChannel,
    addUserToChannel, mentionUsersInChannel
} = require("./discordUtils");
const {getTeamByName} = require("./apiRequest");

const createMatch = async (match, guild) => {

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
            if(!checkIfChannelExists(guild, channelName, category.id)){
                const channel = await createChannel(teamName, category, guild, channelName);

                for (const user of users) {
                    const discordUser = await guild.client.users.fetch(user);
                    await addUserToChannel(channel, discordUser);
                }
                await mentionUsersInChannel(channel, users, hoursMinutes);
            }else{
                console.log('Channel already exists:', channelName);
            }
        } catch (error) {
            console.error('Error creating voice channel:', error);
        }
    }
}

const deleteChannels = async (match, guild) => {
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

module.exports = {createMatch, deleteChannels};