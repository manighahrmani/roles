import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, PATH_TO_CSV, CLIENT_ID } from './secrets.js';
import { SELECT_ROLE, getCourseRole, ADDED_ROLES, BLOCK, REMOVED_ROLES, SELECT_ROLE_NICKNAME } from './config.js';

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
    const selectStudentRole = guild.roles.cache.get(SELECT_ROLE);

    if (!selectStudentRole) {
      console.error('Error: Role not found.');
      console.log('Role ID:', SELECT_ROLE);
      console.log('Role nickname:', SELECT_ROLE_NICKNAME);
      return;
    }

    try {
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

      // Fetching members with the role
      await guild.members.fetch();
      const placementStudents = guild.members.cache.filter((member) =>
        member.roles.cache.has(selectStudentRole.id),
      );

      console.log(`Found ${placementStudents.size} students with the role "placement-student".`);

      placementStudents.forEach((student) => {
        const nickname = student.displayName;
        const idMatch = nickname.match(/UP(\d{5,7})/i);

        if (!idMatch) {
          console.error(`Error: Invalid nickname format for ${nickname}`);
          return;
        }

        const studentId = idMatch[1];
        console.log(`Parsed ID ${studentId} for student ${nickname}.`);

        const matchingRow = data.find((row) => row['Student No'] === studentId);

        if (!matchingRow) {
          console.error(`Error: No matching row found for student ID "${studentId}".`);
          return;
        }

        if (matchingRow && matchingRow['Block Number'] === BLOCK) {
          console.log(`Updating roles for student ${nickname}...`);
          student.roles.remove(REMOVED_ROLES);

          for (const role of ADDED_ROLES) {
            student.roles.add(role);
          }

          console.log(`Adding course role for ${matchingRow.Course} which has ID ${getCourseRole(matchingRow.Course)}`);
          student.roles.add(getCourseRole(matchingRow.Course));
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }

    await interaction.reply('Roles have been updated.');
  }
});

client.login(TOKEN);
