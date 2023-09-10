import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV } from './secrets.js';
import { SELECT_ROLE, getCourseRole, ADDED_ROLES, BLOCK, REMOVED_ROLES } from './config.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(SERVER_ID); // Using SERVER_ID from config.js

  if (!guild) {
    console.error(`Error: Guild with ID ${SERVER_ID} not found.`);
    return;
  }

  const selectedRole = guild.roles.cache.find((role) => role.name === SELECT_ROLE);

  if (!selectedRole) {
    console.error('Error: Role "{SELECT_ROLE}" not found.');
    return;
  }

  try {
    const data = [];
    fs.createReadStream(PATH_TO_CSV)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        const selectedMembers = guild.members.cache.filter((member) =>
          member.roles.cache.has(selectedRole.id),
        );

        selectedMembers.forEach((selectedMember) => {
          const nickname = selectedMember.displayName;
          const idMatch = nickname.match(/UP(\d{5,7})/i);

          if (!idMatch) {
            console.error(`Error: Invalid nickname format for ${nickname}`);
            return;
          }

          const studentId = idMatch[1];
          const matchingRow = data.find((row) => row['Student No'] === studentId);

          if (matchingRow && matchingRow['Block Number'] === BLOCK) {
            selectedMember.roles.remove(REMOVED_ROLES);

            for (const role of ADDED_ROLES) {
              selectedMember.roles.add(role);
            }

            selectedMember.roles.add(getCourseRole(matchingRow.Course));
          }
        });
      });
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
});

client.login(TOKEN);
