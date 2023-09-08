## How to Create and Run a Discord Bot

### Step 1: Create a Bot on Discord Developer Portal

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on `New Application`.
3. Name your application and click `Create`.

### Step 2: Enable Bot Permissions

1. Navigate to the `Bot` tab in your application's settings.
2. Click on `Add Bot`.
3. Under the `Bot Permissions` section, select the following permissions:

   - Read Messages
   - Send Messages
   - Manage Roles
   - Read Guild Members
   - View Channels

   The permissions integer will be `268577696`.

### Step 3: Get the Bot Token, Server ID, and Client ID

1. **Bot Token**: Under the `Bot` tab, find and copy the `TOKEN` by clicking `Copy` under the `TOKEN` section.
2. **Server ID**: In Discord, right-click on your server name and choose `Copy ID`.
3. **Client ID**: Back in the Developer Portal, go to the `General Information` tab and copy the `CLIENT ID`.

### Step 4: Set Up Your Project

1. Create a new directory for your project.
2. Inside this directory, create two JavaScript files named `withCommands.js` and `withoutCommands.js`.
3. Also create a `config.js` file.

#### Inside `config.js`

Populate the `config.js` with the following constants:

`\`\`\`js`
export const TOKEN = "Your_Token_Here";
export const SERVER_ID = "Your_Server_ID_Here";
export const CLIENT_ID = "Your_Client_ID_Here";
export const PATH_TO_CSV = "Path_to_your_CSV_file";
\`\`\`

### Step 5: Install Dependencies

Open your terminal, navigate to your project folder and run:

\`\`\`bash
npm install discord.js csv-parser
\`\`\`

### Step 6: Run the Bot

1. To run the bot with commands, execute:

   \`\`\`bash
   node withCommands.js
   \`\`\`

2. To run the bot without commands, execute:

   \`\`\`bash
   node withoutCommands.js
   \`\`\`

And there you have it! Your bot should be up and running.

---
