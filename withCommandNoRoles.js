import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV, CLIENT_ID } from './secrets.js';
import { getCourseRole, TEST_ROLE } from './config.js';

const blockRoleMap = {
  '1': '1149706610982264903',
  '2': '1149706669232771143',
  '3': '1149706993813176452',
  '3P': '761289612068388874',
};

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
    await guild.members.fetch();
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

    allMembers.forEach((member) => {
      const nickname = member.displayName;
      const idMatch = nickname.match(/UP(\d{5,7})/i);

      // Add the test3 role to the selected members regardless of the CSV file
      member.roles.add(TEST_ROLE);

      if (idMatch) {
        const studentId = idMatch[1];
        const matchingRow = data.find((row) => row['Student No'] === studentId);

        if (matchingRow) {
          const block = matchingRow['Block Number'];
          const course = matchingRow['Course'];

          const blockRole = blockRoleMap[block];
          const courseRole = getCourseRole(course);

          if (blockRole) {
            member.roles.add(blockRole);
          }

          if (courseRole) {
            member.roles.add(courseRole);
          }
        }
      }
    });

    await interaction.reply('Roles have been updated.');
  }
});

client.login(TOKEN);
