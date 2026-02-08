import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

// Configuration from environment
const {
    DISCORD_BOT_TOKEN,
    DISCORD_CLIENT_ID,
    N8N_WEBHOOK_URL,
    REMOTE_TRIGGER_SECRET
} = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
    console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID');
    process.exit(1);
}

// Available workflows
const WORKFLOWS = [
    { name: 'Health Check', value: '/health-check' },
    { name: 'Night Shift', value: '/night-shift' },
    { name: 'Monitor All', value: '/monitor-all' },
    { name: 'Debug', value: '/debug' },
    { name: 'Triage', value: '/triage' },
    { name: 'CI Doctor', value: '/ci-doctor' },
    { name: 'Evolve', value: '/evolve' },
];

// Create the bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Slash command definitions
const commands = [
    new SlashCommandBuilder()
        .setName('ironforge')
        .setDescription('Trigger IronForge agent workflows')
        .addStringOption(option =>
            option
                .setName('workflow')
                .setDescription('Which workflow to run')
                .setRequired(true)
                .addChoices(...WORKFLOWS)
        )
        .addStringOption(option =>
            option
                .setName('branch')
                .setDescription('Target branch (default: main)')
                .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('ironforge-status')
        .setDescription('Check IronForge system status'),
].map(cmd => cmd.toJSON());

// Register commands on startup
async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        console.log('✅ Slash commands registered');
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
}

// Trigger n8n webhook
async function triggerWorkflow(workflow, branch, user) {
    const webhookUrl = N8N_WEBHOOK_URL || 'https://ironforge-coolify.tailafb692.ts.net/webhook/ironforge-trigger';

    const payload = {
        workflow,
        branch: branch || 'main',
        token: REMOTE_TRIGGER_SECRET,
        source: 'discord',
        user: user
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Handle interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ironforge') {
        await interaction.deferReply();

        const workflow = interaction.options.getString('workflow');
        const branch = interaction.options.getString('branch') || 'main';
        const user = `${interaction.user.username}#${interaction.user.discriminator}`;

        console.log(`🎯 Triggering ${workflow} on ${branch} by ${user}`);

        const result = await triggerWorkflow(workflow, branch, user);

        if (result.success) {
            await interaction.editReply({
                content: `✅ **Triggered \`${workflow}\`** on branch \`${branch}\`\n\n🔗 Check progress: <https://github.com/Techlemariam/IronForge/actions>`
            });
        } else {
            await interaction.editReply({
                content: `❌ **Failed to trigger workflow**\n\`\`\`${result.error}\`\`\``
            });
        }
    }

    if (interaction.commandName === 'ironforge-status') {
        await interaction.reply({
            content: `🔍 **IronForge Status**\n\n` +
                `• **n8n**: Online at \`ironforge-coolify.tailafb692.ts.net\`\n` +
                `• **GitHub Actions**: <https://github.com/Techlemariam/IronForge/actions>\n` +
                `• **Available Workflows**: ${WORKFLOWS.map(w => `\`${w.value}\``).join(', ')}`
        });
    }
});

// Start the bot
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Webhook URL: ${N8N_WEBHOOK_URL || 'https://ironforge-coolify.tailafb692.ts.net/webhook/ironforge-trigger'}`);
});

// Initialize
registerCommands();
client.login(DISCORD_BOT_TOKEN);
