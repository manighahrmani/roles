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

/**
 * Fetches all guild members and filters those who have both SOFTENG and LEVEL_5 roles.
 * @param {Guild} guild - The guild to fetch members from.
 * @returns {Collection<Snowflake, GuildMember>} The members to update.
 */
async function getMembersToUpdate(guild) {
  await guild.members.fetch();
  return guild.members.cache.filter(member =>
    member.roles.cache.has(SOFTENG_ROLE_ID) &&
    member.roles.cache.has(LEVEL_5_ROLE_ID),
  );
}

/**
 * Updates the roles for a member and logs the update.
 * @param {GuildMember} member - The member to update.
 * @param {Guild} guild - The guild the member belongs to.
 */
async function updateMemberRoles(member, guild) {
  try {
    await member.roles.add([WEB_PRO_ROLE_ID, UX_DESIGN_ROLE_ID]);
    const oldRoles = [SOFTENG_ROLE_ID, LEVEL_5_ROLE_ID]
      .map(id => guild.roles.cache.get(id)?.name)
      .join(', ');

    const newRoles = [WEB_PRO_ROLE_ID, UX_DESIGN_ROLE_ID]
      .map(id => guild.roles.cache.get(id)?.name)
      .join(', ');

    const logEntry = `Updated ${member.displayName}. Roles: ${oldRoles} => Added: ${newRoles}\n`;
    fs.appendFileSync('log.txt', logEntry);
  } catch (error) {
    console.error(`Could not update roles for ${member.displayName}: ${error}`);
  }
}

/**
 * The main function that is called when the client is ready.
 */
async function main() {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(SERVER_ID);
  if (!guild) {
    console.log('Guild not found');
    return;
  }

  const membersToUpdate = await getMembersToUpdate(guild);

  console.log(`Total members to update: ${membersToUpdate.size}`);

  membersToUpdate.forEach(member => updateMemberRoles(member, guild));
}

client.on('ready', main);

client.login(TOKEN);