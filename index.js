const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const token = 'YOUR_DISCORD_BOT_TOKEN';
const clientId = 'YOUR_DISCORD_CLIENT_ID';
const guildId = 'YOUR_DISCORD_GUILD_ID';

const commands = [
  {
    name: 'explain',
    description: 'Get an explanation for a specific argument.',
    options: [
      {
        name: 'framework',
        type: 'STRING',
        description: 'The name of the epistemological framework.',
        required: true,
      },
      {
        name: 'argument',
        type: 'STRING',
        description: 'The name of the argument.',
        required: true,
      },
    ],
  },
];

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
  console.log('Bot is ready!');

  const rest = new REST({ version: '9' }).setToken(token);

  (async () => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );

      console.log('Slash commands registered!');
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'explain') {
    const framework = options.getString('framework');
    const argument = options.getString('argument');

    try {
      const explanation = getExplanation(framework, argument);
      await interaction.reply(`**${argument}**: ${explanation}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('Oops! Something went wrong.');
    }
  }
});

function getExplanation(framework, argument) {
  try {
    const filePath = `./explanations/${framework}.json`;
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    const argumentObj = jsonData.arguments.find((arg) => arg.name === argument);

    if (!argumentObj) {
      throw new Error('Argument not found.');
    }

    return argumentObj.explanation;
  } catch (error) {
    throw new Error('Failed to retrieve explanation.');
  }
}

client.login(token);
