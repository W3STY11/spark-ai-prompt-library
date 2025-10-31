const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage connection
const STORAGE_ACCOUNT = 'sparkpromptstorage';
const STORAGE_CONTAINER = 'data';
const PROMPTS_FILE = 'prompts_index.json';

app.http('prompts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request for prompts');

        try {
            // Get query parameters
            const department = request.query.get('department');
            const subcategory = request.query.get('subcategory');
            const search = request.query.get('search');
            const limit = parseInt(request.query.get('limit') || '50');

            // Connect to Azure Storage using Managed Identity
            const blobServiceClient = new BlobServiceClient(
                `https://${STORAGE_ACCOUNT}.blob.core.windows.net`
            );
            const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER);
            const blobClient = containerClient.getBlobClient(PROMPTS_FILE);

            // Download the prompts index
            const downloadResponse = await blobClient.download();
            const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
            const data = JSON.parse(downloaded.toString());

            let prompts = data.prompts || [];

            // Filter by department
            if (department && department !== 'All') {
                prompts = prompts.filter(p => p.department === department);
            }

            // Filter by subcategory
            if (subcategory && subcategory !== 'All') {
                prompts = prompts.filter(p => p.subcategory === subcategory);
            }

            // Filter by search term
            if (search) {
                const searchLower = search.toLowerCase();
                prompts = prompts.filter(p =>
                    (p.title && p.title.toLowerCase().includes(searchLower)) ||
                    (p.description && p.description.toLowerCase().includes(searchLower)) ||
                    (p.content && p.content.toLowerCase().includes(searchLower))
                );
            }

            // Limit results
            prompts = prompts.slice(0, limit);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    total: prompts.length,
                    prompts: prompts.map(p => ({
                        id: p.id,
                        title: p.title,
                        department: p.department,
                        subcategory: p.subcategory,
                        description: p.description,
                        content: p.content,
                        icon: p.icon,
                        word_count: p.word_count
                    }))
                })
            };

        } catch (error) {
            context.log.error('Error fetching prompts:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Failed to fetch prompts',
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
