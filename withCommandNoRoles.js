import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV, CLIENT_ID } from './secrets.js';
import { getCourseRole, BLOCK_ROLE_MAP, POST_ROLE } from './config.js';

let progressBarLength = 50;  // Length of progress bar
let progress = 0;  // Initialize progress
let totalMembers = 0;  // Initialize total members
let processedMembers = 0;  // Initialize processed members

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const commands = [
  {
    name: 'updateroles',
    description: 'Updates student roles based on a CSV file',
  },
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID),
      { body: commands },
    );
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'cleanroles') {
    const guild = interaction.guild;
    await guild.members.fetch({ force: true }); // Fetch all members live from the server
    const allMembers = guild.members.cache;

    const data = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(PATH_TO_CSV)
        .pipe(csv())
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          console.log(`Finished reading CSV. Total rows: ${data.length}`);
          resolve();
        })
        .on('error', reject);
    });

    allMembers.forEach(async (member) => {
      const nickname = member.displayName;

      // Skip this member if they have more than the default "@everyone" role
      if (member.roles.cache.size > 1) return;

      console.log('Updating roles for', nickname);


      const idMatch = nickname.match(/UP(\d{5,7})/i);
      if (idMatch) {
        const studentId = idMatch[1];
        const matchingRow = data.find((row) => row['Student No'] === studentId);

        if (matchingRow) {
          const course = matchingRow.Course;

          if (course.startsWith('MSC')) {
            // If course starts with MSC, add the special role and continue
            try {
              await member.roles.add(POST_ROLE); // Replace with the actual role ID for MSC
              console.log(`Added MSC-specific role for ${nickname}`);
              return; // Skip the remaining block and course role assignments
            } catch (error) {
              console.error(`Could not add MSC-specific role: ${error}`);
            }
          }

          const block = matchingRow['Block Number'];
          const blockRole = BLOCK_ROLE_MAP[block];
          const courseRole = getCourseRole(course);

          if (blockRole) {
            try {
              console.log('Adding block role:', blockRole);
              await member.roles.add(blockRole); // Add error-handling here
            } catch (error) {
              console.error('Could not add block role:', error);
            }
          }

          if (courseRole) {
            try {
              console.log('Adding course role:', courseRole);
              await member.roles.add(courseRole); // Add error-handling here
            } catch (error) {
              console.error('Could not add course role:', error);
            }
          }
        } else {
          console.log('Did not find a matching row in the CSV file for ID: ', studentId);
        }
      } else {
        console.log('Did not find an ID in the nickname: ', nickname);
      }
    });
    await interaction.reply('Roles have been updated.');
  }
});

client.login(TOKEN);
