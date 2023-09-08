import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, CLIENT_ID, PATH_TO_CSV } from './config.js';

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
    const placementStudentRole = guild.roles.cache.get('761289612068388874');

    if (!placementStudentRole) {
      console.error('Error: Role "placement-student" not found.');
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
          .on('end', resolve)
          .on('error', reject);
      });

      // Fetching members with the role
      await guild.members.fetch();
      const placementStudents = guild.members.cache.filter((member) =>
        member.roles.cache.has(placementStudentRole.id),
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
          console.error(`Error: No matching row for student ${nickname}.`);
          return;
        }

        if (matchingRow && matchingRow['Block Number'] === '4') {
          console.log(`Updating roles for ${nickname}`);
          student.roles.remove([...student.roles.cache.keys()]);
          student.roles.add([
            '1149738387033559140', // test
            '1149706993813176452', // L6
            getCourseRole(matchingRow.Course),
          ]);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }

    await interaction.reply('Roles have been updated.');
  }
});

function getCourseRole(courseName) {
  const courseRoleMap = {
    // your mappings here
  };

  return courseRoleMap[courseName] || null;
}

client.login(TOKEN);
