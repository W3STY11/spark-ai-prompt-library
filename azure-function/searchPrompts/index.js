const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage connection
const STORAGE_ACCOUNT = 'sparkpromptstorage';
const STORAGE_CONTAINER = 'data';
const PROMPTS_FILE = 'prompts_index.json';

app.http('searchPrompts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts/search',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a search request');

        try {
            // Get query parameters
            const query = request.query.get('query')?.toLowerCase() || '';
            const department = request.query.get('department');
            const tags = request.query.get('tags')?.toLowerCase();
            const complexity = request.query.get('complexity');
            const limit = Math.min(parseInt(request.query.get('limit') || '10'), 50);

            // Connect to Azure Storage using connection string from environment
            const connectionString = process.env.AzureWebJobsStorage;
            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER);
            const blobClient = containerClient.getBlobClient(PROMPTS_FILE);

            // Download the prompts index
            const downloadResponse = await blobClient.download();
            const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
            const data = JSON.parse(downloaded.toString());

            let prompts = data.prompts || [];

            // Filter by search query
            if (query) {
                prompts = prompts.filter(prompt => {
                    const titleMatch = prompt.title?.toLowerCase().includes(query);
                    const descMatch = prompt.description?.toLowerCase().includes(query);
                    const contentMatch = prompt.content?.toLowerCase().includes(query);
                    return titleMatch || descMatch || contentMatch;
                });
            }

            // Filter by department
            if (department && department !== 'All') {
                prompts = prompts.filter(p => p.department === department);
            }

            // Filter by tags
            if (tags) {
                prompts = prompts.filter(p => p.tags?.toLowerCase().includes(tags));
            }

            // Filter by complexity
            if (complexity) {
                prompts = prompts.filter(p => p.complexity === complexity);
            }

            // Limit results
            const results = prompts.slice(0, limit);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    results: results.map(p => ({
                        id: p.id,
                        title: p.title,
                        department: p.department,
                        subcategory: p.subcategory,
                        description: p.description,
                        tags: p.tags,
                        complexity: p.complexity,
                        word_count: p.word_count,
                        icon: p.icon
                    })),
                    total: prompts.length,
                    query: query || 'all'
                })
            };

        } catch (error) {
            context.log.error('Error searching prompts:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Failed to search prompts',
                    message: error.message
                })
            };
        }
    }
});

// Helper function to convert stream to buffer
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
