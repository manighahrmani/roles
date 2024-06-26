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

Alternatively go to `OAuth2` tab, in the drop-down select `URL Generator`, select `bot` as the `SCOPES` and then select the bot permissions in the `BOT PERMISSIONS` section. This will generate a URL that you can use to invite the bot to your server.
### Step 3: Get the Bot Token, Server ID, and Client ID

1. **Bot Token**: Under the `Bot` tab, find and copy the `TOKEN` by clicking `Copy` under the `TOKEN` section.
2. **Server ID**: In Discord, right-click on your server name and choose `Copy ID`.
3. **Client ID**: Back in the Developer Portal, go to the `General Information` tab and copy the `CLIENT ID`.

### Step 4: Set Up Your Project

1. Create a new directory for your project.
2. Inside this directory, create two JavaScript files named `withCommands.js` and `withoutCommands.js`.
3. Also create a `config.js` file and a `courseRoleMap.js` file.

#### Inside `config.js`

Populate the `config.js` with the following constants:

```js
export const TOKEN = "Your_Token_Here";
export const SERVER_ID = "Your_Server_ID_Here";
export const CLIENT_ID = "Your_Client_ID_Here";
export const PATH_TO_CSV = "Path_to_your_CSV_file";
```

Inside `courseRoleMap.js`, you will map the course names to Discord Role IDs::

```js
export const courseRoleMap = {
  'BSC (HONS) COMPUTER SCIENCE': 'actualSnowflakeIDHere',
  // Add more mappings here
};
```

### Step 5: Fetching Role IDs from Discord Server

1. Open Discord and go to the server where your bot resides.
1. Make sure you have `Developer Mode` enabled in Discord settings.
1. Right-click on the role name you want to map and click `Copy ID`.
1. Place this ID in the `courseRoleMap.js` next to the relevant course name.

### Step 6: Install Dependencies

Open your terminal, navigate to your project folder and run:

```js
npm install discord.js csv-parser
```

### Step 6: Run the Bot

1. To run the bot with commands, execute:

   ```js
   node withCommands.js
   ```

   Then in a channel with the bot, type `/updateRoles` (e.g., in `#ptchat-mani-l7`).

2. To run the bot without commands, execute:

   ```js
   node withoutCommands.js
   ```

---
