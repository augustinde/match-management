# Bot match-management

## Dev setup
Update the matchDate of the first match in db.json file in fake-api folder at line 380 with the current date + 30min. (https://www.unixtimestamp.com/)

Launch api in fake-api with `npm run start` and discord bot with `npm run start` in discordBot folder.

Deploy commands with `npm run deploy-cmd` in discordBot folder.

## Features

- Create 2 voice channels for matches with the right permissions and mention the users in the channel.
- Manually add permissions to a user to access his team's channel (if the user does not have the necessary authorization). 
- Manually remove permissions to a user to access to a channel.
- Manually create voices channels for a match with one command.

## Configuration

Add this variables to your .env file in discordBot folder : 

```env
APP_ID=<YOUR_DISCORD_APP_ID>
DISCORD_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
PUBLIC_KEY=<YOUR_DISCORD_PUBLIC_KEY>
GUILD_ID=<YOUR_DISCORD_GUILD_ID>
```

Configure the config.json file in discordBot folder with your own values.

`apiUrl` : The url of the api. (default: http://localhost:3000)

`cronSchedule` : The cron schedule to check for new matches. (default: 0 0-23 * * * => every hour at minute 0)' 

`channelUserLimit` : The maximum number of users that can be in a channel. (default: 10)

`maximumNumberOfHoursToRetrieveFutureMatches` : The maximum number of hours to retrieve future matches. (default: 2)

`maximumMatchDuration` : The maximum duration of a match in hours. (default: 4)

## IMPORTANT

You need to uncomment the lines in apiRequest to call the right api