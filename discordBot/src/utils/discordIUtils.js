const {ChannelType, PermissionsBitField} = require("discord.js");

const createChannel = async (teamName, category, guild, channelName) => {
    try {
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: category.id,
            userLimit: 8,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        });
        console.log('Voice channel created:' + teamName + ' in category:' + category.name);
        return channel;
    } catch (error) {
        console.error('Error creating channel:' + teamName + '\n' + error);
    }
}

const addUserToChannel = async (channel, user) => {
    try {
        await channel.permissionOverwrites.edit(
            user,
            {
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        );
        console.log('User ' + user + ' added to channel:' + channel.name);
    } catch (error) {
        console.error('Error adding user' + user + ' to channel:' + channel.name + '\n' + error);
    }
}

const getCategoryWithName = (guild, name) => {
    return guild.channels.cache.find(c => c.name.includes(name) && c.type === ChannelType.GuildCategory);
}

const checkIfChannelExists = (guild, name) => {
    return guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildVoice);
}

module.exports = { createChannel, addUserToChannel, getCategoryWithName, checkIfChannelExists };