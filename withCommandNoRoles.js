import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV, CLIENT_ID } from './secrets.js';
import { getCourseRole, BLOCK_ROLE_MAP, POST_ROLE, TEST_ROLE } from './config.js';

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

  if (commandName === 'updateroles') {
    const guild = interaction.guild;
    await guild.members.fetch({ force: true }); 
    const allMembers = guild.members.cache;

    let progressBarLength = 50;
    let progress = 0;
    let totalMembers = allMembers.size;
    let processedMembers = 0;

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
      processedMembers++;
      progress = Math.round((processedMembers / totalMembers) * progressBarLength);
      const progressBar = '[' + '='.repeat(progress) + '-'.repeat(progressBarLength - progress) + ']';
      console.log(`Progress: ${progressBar} (${processedMembers}/${totalMembers})`);

      if (member.roles.cache.size > 1) return;

      member.roles.add(TEST_ROLE);

      let errorOccured = false;
      const nickname = member.displayName;

      try {
        await member.roles.add(POST_ROLE);
      } catch (error) {
        console.error(`Could not add POST_ROLE: ${error}`);
        errorOccured = true;
      }

      const idMatch = nickname.match(/UP(\d{5,7})/i);

      if (idMatch) {
        const studentId = idMatch[1];
        const matchingRow = data.find((row) => row['Student No'] === studentId);

        if (matchingRow) {
          const course = matchingRow.Course;

          if (course.startsWith('MSC')) {
            try {
              await member.roles.add('760456815724593152');
              console.log(`Added MSC-specific role for ${nickname}`);
              return;
            } catch (error) {
              console.error(`Could not add MSC-specific role: ${error}`);
              errorOccured = true;
            }
          }

          const block = matchingRow['Block Number'];
          const blockRole = BLOCK_ROLE_MAP[block];
          const courseRole = getCourseRole(course);

          if (blockRole) {
            try {
              await member.roles.add(blockRole);
            } catch (error) {
              console.error(`Could not add block role: ${error}`);
              errorOccured = true;
            }
          }

          if (courseRole) {
            try {
              await member.roles.add(courseRole);
            } catch (error) {
              console.error(`Could not add course role: ${error}`);
              errorOccured = true;
            }
          }
        } else {
          console.log(`Did not find a matching row in the CSV file for ID: ${studentId}`);
        }
      } else {
        console.log(`Did not find an ID in the nickname: ${nickname}`);
      }

      if (errorOccured) {
        fs.appendFileSync('error_log.txt', `An error occurred for ${nickname}: See console for details.\n`);
      }
    });

    await interaction.reply('Roles have been updated.');
  }
});

client.login(TOKEN);
