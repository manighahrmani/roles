import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import { TOKEN, SERVER_ID } from './secrets.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const SOFTENG_ROLE_ID = '1149707019692036156'; // Role ID for softeng
const LEVEL_5_ROLE_ID = '1149706669232771143'; // Role ID for Level 5
const WEB_PRO_ROLE_ID = '1151210884564262993'; // Role ID for web-pro
const UX_DESIGN_ROLE_ID = '1151210947512373268'; // Role ID for ux-design

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(SERVER_ID);
  if (!guild) {
    console.log('Guild not found');
    return;
  }

  // Fetch all guild members
  await guild.members.fetch();

  const membersToUpdate = guild.members.cache.filter(member =>
    member.roles.cache.has(SOFTENG_ROLE_ID) &&
    member.roles.cache.has(LEVEL_5_ROLE_ID),
  );

  console.log(`Total members to update: ${membersToUpdate.size}`);

  membersToUpdate.forEach(async (member) => {
    try {
      await member.roles.add([WEB_PRO_ROLE_ID, UX_DESIGN_ROLE_ID]);
      const logEntry = `Updated ${member.displayName}. Roles: ${[SOFTENG_ROLE_ID, LEVEL_5_ROLE_ID].map(id => guild.roles.cache.get(id)?.name).join(', ')} => Added: ${[WEB_PRO_ROLE_ID, UX_DESIGN_ROLE_ID].map(id => guild.roles.cache.get(id)?.name).join(', ')}\n`;
      fs.appendFileSync('log.txt', logEntry);
    } catch (error) {
      console.error(`Could not update roles for ${member.displayName}: ${error}`);
    }
  });
});

client.login(TOKEN);
