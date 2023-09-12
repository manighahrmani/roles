import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV, CLIENT_ID } from '../secrets.js';
import { getCourseRole, BLOCK_ROLE_MAP, POST_ROLE, TEST_ROLE } from '../config.js';

const DISALLOWED_ROLES_FOR_PG = [
  '1149706610982264903', // L4
  '1149706669232771143', // L5
  '1149706993813176452', // L6
  '761289612068388874', // placement-student
  '1149706993813176452', // L6
];

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

    const progressBarLength = 50;
    let progress = 0;
    const totalMembers = allMembers.size;
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

    const postGradRoleID = 'Your_Post_Grad_Role_ID_Here'; // Replace with the actual post-grad role ID
    const postGradMembers = allMembers.filter(member => member.roles.cache.has(postGradRoleID));

    for (const member of postGradMembers.values()) {
      const nickname = member.displayName;
      const idMatch = nickname.match(/UP(\d{5,7})/i);

      if (idMatch) {
        const studentId = idMatch[1];
        const matchingRow = data.find((row) => row['Student No'] === studentId);

        if (matchingRow) {
          const course = matchingRow.Course;
          if (!course.startsWith('MSC')) {
            console.error(`Course does not start with MSC for ID: ${studentId}`);
          }
        } else {
          await member.roles.remove(postGradRoleID);
        }

        for (const disallowedRole of DISALLOWED_ROLES_FOR_PG) {
          if (member.roles.cache.has(disallowedRole)) {
            await member.roles.remove(disallowedRole);
          }
        }
      }
    }

    // The existing logic for other roles can go here.

    await interaction.reply('Roles have been updated.');
  }
});

client.login(TOKEN);
