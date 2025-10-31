const { app } = require('@azure/functions');
const { CloudAdapter, ConfigurationBotFrameworkAuthentication, TurnContext, CardFactory, MessageFactory } = require('botbuilder');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage connection
const STORAGE_ACCOUNT = 'sparkpromptstorage';
const STORAGE_CONTAINER = 'data';
const PROMPTS_FILE = 'prompts_index.json';

// Bot Framework authentication
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    {},
    {
        MicrosoftAppId: process.env.MicrosoftAppId,
        MicrosoftAppPassword: process.env.MicrosoftAppPassword,
        MicrosoftAppType: process.env.MicrosoftAppType,
        MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
    }
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Error handling
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    console.error(error);

    await context.sendActivity('Sorry, I encountered an error processing your request.');
};

// In-memory cache for prompts data
let promptsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getPromptsData() {
    const now = Date.now();

    // Return cached data if still valid
    if (promptsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        return promptsCache;
    }

    // Fetch from Azure Storage
    const blobServiceClient = new BlobServiceClient(
        `https://${STORAGE_ACCOUNT}.blob.core.windows.net`
    );
    const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER);
    const blobClient = containerClient.getBlobClient(PROMPTS_FILE);

    const downloadResponse = await blobClient.download();
    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
    const data = JSON.parse(downloaded.toString());

    promptsCache = data;
    cacheTimestamp = now;

    return data;
}

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

function searchPrompts(prompts, query) {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ').filter(w => w.length > 2);

    return prompts
        .map(prompt => {
            let score = 0;
            const titleLower = (prompt.title || '').toLowerCase();
            const descLower = (prompt.description || '').toLowerCase();
            const contentLower = (prompt.content || '').toLowerCase();
            const deptLower = (prompt.department || '').toLowerCase();
            const subLower = (prompt.subcategory || '').toLowerCase();

            // Exact match in title (highest priority)
            if (titleLower.includes(queryLower)) score += 100;

            // Word matches in title
            words.forEach(word => {
                if (titleLower.includes(word)) score += 10;
                if (descLower.includes(word)) score += 5;
                if (subLower.includes(word)) score += 8;
                if (deptLower.includes(word)) score += 7;
                if (contentLower.includes(word)) score += 2;
            });

            return { prompt, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.prompt);
}

function createPromptCard(prompt) {
    return CardFactory.adaptiveCard({
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
            {
                type: 'Container',
                items: [
                    {
                        type: 'TextBlock',
                        text: `${prompt.icon || '✨'} ${prompt.title}`,
                        size: 'Large',
                        weight: 'Bolder',
                        wrap: true
                    },
                    {
                        type: 'ColumnSet',
                        columns: [
                            {
                                type: 'Column',
                                width: 'auto',
                                items: [
                                    {
                                        type: 'TextBlock',
                                        text: `📁 ${prompt.department}`,
                                        size: 'Small',
                                        color: 'Accent'
                                    }
                                ]
                            },
                            {
                                type: 'Column',
                                width: 'auto',
                                items: [
                                    {
                                        type: 'TextBlock',
                                        text: ` | 📌 ${prompt.subcategory}`,
                                        size: 'Small',
                                        color: 'Accent'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: 'TextBlock',
                        text: prompt.description || 'No description available',
                        wrap: true,
                        spacing: 'Medium'
                    },
                    {
                        type: 'TextBlock',
                        text: `📝 ${prompt.word_count || 0} words`,
                        size: 'Small',
                        isSubtle: true,
                        spacing: 'Small'
                    }
                ]
            }
        ],
        actions: [
            {
                type: 'Action.OpenUrl',
                title: 'View Full Prompt',
                url: `https://victorious-bush-0ff64fc0f.3.azurestaticapps.net/view?id=${prompt.id}`
            },
            {
                type: 'Action.Submit',
                title: 'Show Content',
                data: {
                    action: 'showContent',
                    promptId: prompt.id
                }
            }
        ]
    });
}

async function handleMessage(context) {
    const userMessage = context.activity.text;

    try {
        // Get prompts data
        const data = await getPromptsData();
        const allPrompts = data.prompts || [];

        // Simple intent detection
        const messageLower = userMessage.toLowerCase();

        // Help/Welcome
        if (messageLower.match(/\b(help|start|hello|hi)\b/)) {
            await context.sendActivity({
                type: 'message',
                text: `# 👋 Welcome to SPARK AI Prompt Library!\n\n` +
                      `I have access to **${allPrompts.length} professional AI prompts** across 9 departments:\n\n` +
                      `💼 Business | 📢 Marketing | 💰 Sales | 🔍 SEO | 💵 Finance\n` +
                      `📚 Education | ✍️ Writing | ⚡ Productivity | 🚀 Solopreneurs\n\n` +
                      `**What I can do:**\n` +
                      `- Search prompts: "find sales email prompts"\n` +
                      `- Browse by topic: "show me marketing prompts"\n` +
                      `- Get recommendations: "I need help with business strategy"\n` +
                      `- Show specific prompts: "prompt about cold outreach"\n\n` +
                      `Try asking me anything!`
            });
            return;
        }

        // Handle card actions (Show Content)
        if (context.activity.value && context.activity.value.action === 'showContent') {
            const promptId = context.activity.value.promptId;
            const prompt = allPrompts.find(p => p.id === promptId);

            if (prompt) {
                const content = prompt.content || 'Content not available';
                const truncatedContent = content.length > 2000
                    ? content.substring(0, 2000) + '...\n\n[View full content in app]'
                    : content;

                await context.sendActivity({
                    type: 'message',
                    text: `# ${prompt.icon || '✨'} ${prompt.title}\n\n${truncatedContent}`,
                    attachments: [CardFactory.adaptiveCard({
                        type: 'AdaptiveCard',
                        version: '1.4',
                        actions: [{
                            type: 'Action.OpenUrl',
                            title: 'Open in SPARK App',
                            url: `https://victorious-bush-0ff64fc0f.3.azurestaticapps.net/view?id=${prompt.id}`
                        }]
                    })]
                });
                return;
            }
        }

        // Search for prompts
        const results = searchPrompts(allPrompts, userMessage);

        if (results.length === 0) {
            await context.sendActivity(
                `I couldn't find any prompts matching "${userMessage}".\n\n` +
                `Try:\n` +
                `- Using different keywords\n` +
                `- Being more specific\n` +
                `- Browsing by department: "show business prompts"`
            );
            return;
        }

        // Show top results
        const topResults = results.slice(0, 5);
        const attachments = topResults.map(prompt => createPromptCard(prompt));

        const summary = `🎯 **Found ${results.length} prompts matching "${userMessage}"**\n\n` +
                       `Showing top ${topResults.length} results:`;

        await context.sendActivity({
            type: 'message',
            text: summary,
            attachments: attachments,
            attachmentLayout: 'carousel'
        });

        if (results.length > 5) {
            await context.sendActivity(
                `💡 **Tip:** ${results.length - 5} more results available. ` +
                `[Browse all in SPARK App](https://victorious-bush-0ff64fc0f.3.azurestaticapps.net/browse?search=${encodeURIComponent(userMessage)})`
            );
        }

    } catch (error) {
        console.error('Error in handleMessage:', error);
        await context.sendActivity('Sorry, I encountered an error searching for prompts. Please try again.');
    }
}

// Azure Function HTTP trigger for bot messages
app.http('messages', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'messages',
    handler: async (request, context) => {
        context.log('Bot message received');

        try {
            // Get the request body
            const body = await request.text();
            const activity = JSON.parse(body);

            // Create a response that the adapter will populate
            let responseBody;
            let responseStatus = 200;

            // Process the activity with the adapter
            await adapter.process(request, {
                send: (statusCode, body) => {
                    responseStatus = statusCode;
                    responseBody = body;
                },
                on: () => {},
                end: () => {}
            }, async (turnContext) => {
                // Handle the message
                if (turnContext.activity.type === 'message') {
                    await handleMessage(turnContext);
                } else if (turnContext.activity.type === 'conversationUpdate') {
                    // Handle member added (bot joined conversation)
                    if (turnContext.activity.membersAdded) {
                        for (const member of turnContext.activity.membersAdded) {
                            if (member.id !== turnContext.activity.recipient.id) {
                                await turnContext.sendActivity(
                                    '👋 **Welcome to SPARK AI Prompt Library!**\n\n' +
                                    'I can help you find professional AI prompts from our library of 1,800+ prompts.\n\n' +
                                    'Try: "find sales email prompts" or "show me marketing prompts"'
                                );
                            }
                        }
                    }
                }
            });

            return {
                status: responseStatus,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: responseBody || ''
            };

        } catch (error) {
            context.log.error('Error processing bot message:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Internal server error',
                    message: error.message
                })
            };
        }
    }
});
