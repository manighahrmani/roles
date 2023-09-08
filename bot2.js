const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const csv = require('csv-parser');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // Add other needed intents here
  ],
});

const TOKEN = 'MTE0OTc0MDU2NDg4ODE1ODM1OQ.G-2QOr.ybjqnFGNO4W9iFt_yqOmsn7dF4rtyVV9NMxtQE';

// Define the slash command
const commands = [
  {
    name: 'updateroles',
    description: 'Updates student roles based on a CSV file',
  },
];

// Register the slash command with Discord
const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands('1149740564888158359', '760155974467059762'),
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
    const placementStudentRole = guild.roles.cache.find((role) => role.name === 'placement-student');

    if (!placementStudentRole) {
      console.error('Error: Role "placement-student" not found.');
      return;
    }

    try {
      const data = [];
      fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          const placementStudents = guild.members.cache.filter((member) =>
            member.roles.cache.has(placementStudentRole.id),
          );

          placementStudents.forEach((student) => {
            const nickname = student.displayName;
            const idMatch = nickname.match(/UP(\d{5,7})/i);

            if (!idMatch) {
              console.error(`Error: Invalid nickname format for ${nickname}`);
              return;
            }

            const studentId = idMatch[1];
            const matchingRow = data.find((row) => row['Student No'] === studentId);

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
        });
    } catch (error) {
      console.error('Error reading CSV file:', error);
    }

    await interaction.reply('Roles have been updated.');
  }
});

// Helper function to map course names to role names
function getCourseRole(courseName) {
  const courseRoleMap = {
    // your mappings here
  };

  return courseRoleMap[courseName] || null;
}

client.login(TOKEN);
