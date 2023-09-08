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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', async (message) => {
  console.log(`Received message: ${message.content}`);
  if (message.content === '!updateRoles') {
    const guild = message.guild;
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
          // Process the data and update roles for placement students
          const placementStudents = guild.members.cache.filter((member) =>
            member.roles.cache.has(placementStudentRole.id),
          );

          placementStudents.forEach((student) => {
            // Extract student ID from nickname
            const nickname = student.displayName;
            const idMatch = nickname.match(/UP(\d{5,7})/i);

            if (!idMatch) {
              console.error(`Error: Invalid nickname format for ${nickname}`);
              return;
            }

            const studentId = idMatch[1];
            const matchingRow = data.find((row) => row['Student No'] === studentId);

            if (matchingRow && matchingRow['Block Number'] === '4') {
              // Remove existing roles
              student.roles.remove([...student.roles.cache.keys()]);

              // Add new roles
              student.roles.add([
                '1149738387033559140', // test
                '1149706993813176452', // L6
                getCourseRole(matchingRow.Course), // Get the course role based on CSV data
              ]);
            }
          });
        });
    } catch (error) {
      console.error('Error reading CSV file:', error);
    }
  }
});

// Helper function to map course names to role names
function getCourseRole(courseName) {
  const courseRoleMap = {
    'BSC (HONS) COMPUTER SCIENCE': 'compsi',
    'BSC (HONS) BUSINESS INFORMATION SYSTEMS': 'bis',
    'BSC (HONS) COMPUTING': 'computing',
    'BSC (HONS) SOFTWARE ENGINEERING': 'softeng',
    'BSC (HONS) COMPUTER NETWORKS': 'networks-bsc',
    'BSC (HONS) DATA SCIENCE AND ANALYTICS': 'datascience-bsc',
    'BSC (HONS) CYBER SECURITY AND FORENSIC COMPUTING': 'cyfor',
  };

  return courseRoleMap[courseName] || null;
}

client.login(TOKEN);
