const {ChannelType, PermissionsBitField} = require("discord.js");
const config = require("../../config.json");

const USER_LIMIT = config.userLimit;

const createChannel = async (teamName, category, guild, channelName) => {
    try {
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: category.id,
            userLimit: USER_LIMIT,
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

const removeUserFromChannel = async (channel, user) => {
    try {
        await channel.permissionOverwrites.delete(user);
        console.log('User ' + user + ' removed from channel:' + channel.name);
    } catch (error) {
        console.error('Error removing user' + user + ' from channel:' + channel.name + '\n' + error);
    }
}

const getCategoryWithName = (guild, name) => {
    return guild.channels.cache.find(c => c.name.includes(name) && c.type === ChannelType.GuildCategory);
}

const checkIfChannelExists = (guild, name, categoryId) => {
    return guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildVoice && c.parentId === categoryId);
}

const getChannelByName = (guild, name) => {
    return guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildVoice);
}

const mentionUsersInChannel = async (channel, users, matchHour) => {
    let message = `Your match starting soon at ${matchHour}!\n`;
    try{
        for (const user of users) {
            message += `<@${user}>\n`;
        }
        await channel.send(message);
        console.log('Users mentioned in channel:' + channel.name);

    } catch (error) {
        console.error('Error mentioning users in channel:' + channel.name + '\n' + error);
    }
}

module.exports = { createChannel, addUserToChannel, getCategoryWithName, checkIfChannelExists, getChannelByName, removeUserFromChannel, mentionUsersInChannel };