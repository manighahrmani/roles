import fs from 'fs';
import csv from 'csv-parser';
import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN, SERVER_ID, CLIENT_ID } from './config.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    // Add other needed intents here
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(SERVER_ID); // Using SERVER_ID from config.js

  if (!guild) {
    console.error(`Error: Guild with ID ${SERVER_ID} not found.`);
    return;
  }

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
          const idMatch = nickname.match(/up(\d{5,7})/i);

          if (!idMatch) {
            console.error(`Error: Invalid nickname format for ${nickname}`);
            return;
          }

          const studentId = idMatch[1];
          const matchingRow = data.find((row) => row['Student No'] === studentId);

          if (matchingRow && matchingRow['Block Number'] === '4') {
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
});

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
