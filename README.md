# Bot match-management

Update the matchDate of the first match in db.json file in fake-api folder at line 380 with the current date + 30min. (https://www.unixtimestamp.com/)

Launch api in fake-api with `npm run start` and discord bot with `npm run start` in discordBot folder.

Add this variables to your .env file in discordBot folder : 
```env
APP_ID=<YOUR_DISCORD_APP_ID>
DISCORD_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
PUBLIC_KEY=<YOUR_DISCORD_PUBLIC_KEY>
API_URL=http://localhost:3000
GUILD_ID=<YOUR_DISCORD_GUILD_ID>
```

