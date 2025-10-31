import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as fs from 'fs';
import * as path from 'path';

interface Prompt {
    id: string;
    title: string;
    description: string;
    content: string;
    department: string;
    subcategory: string;
    icon: string;
    complexity: string;
    tags: string;
    word_count: number;
    date: string;
}

interface PromptsData {
    prompts: Prompt[];
}

// Load prompts data (in production, this would be from a database)
function loadPrompts(): Prompt[] {
    try {
        const dataPath = path.join(process.cwd(), 'public', 'prompts_index.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data: PromptsData = JSON.parse(rawData);
        return data.prompts || [];
    } catch (error) {
        console.error('Error loading prompts:', error);
        return [];
    }
}

export async function searchPrompts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get query parameters
        const query = request.query.get('query')?.toLowerCase() || '';
        const department = request.query.get('department');
        const tags = request.query.get('tags')?.toLowerCase();
        const complexity = request.query.get('complexity');
        const limit = Math.min(parseInt(request.query.get('limit') || '10'), 50);

        // Load all prompts
        const allPrompts = loadPrompts();

        // Filter prompts based on criteria
        let filteredPrompts = allPrompts.filter(prompt => {
            // Query filter (search in title, description, content)
            if (query && !prompt.title.toLowerCase().includes(query) &&
                !prompt.description.toLowerCase().includes(query) &&
                !prompt.content.toLowerCase().includes(query)) {
                return false;
            }

            // Department filter
            if (department && prompt.department !== department) {
                return false;
            }

            // Tags filter
            if (tags && !prompt.tags.toLowerCase().includes(tags)) {
                return false;
            }

            // Complexity filter
            if (complexity && prompt.complexity !== complexity) {
                return false;
            }

            return true;
        });

        // Sort by relevance (simple scoring based on title matches)
        if (query) {
            filteredPrompts.sort((a, b) => {
                const aScore = a.title.toLowerCase().includes(query) ? 10 : 0;
                const bScore = b.title.toLowerCase().includes(query) ? 10 : 0;
                return bScore - aScore;
            });
        }

        // Limit results
        const results = filteredPrompts.slice(0, limit).map(prompt => ({
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            department: prompt.department,
            subcategory: prompt.subcategory,
            icon: prompt.icon,
            complexity: prompt.complexity,
            tags: prompt.tags,
            word_count: prompt.word_count
        }));

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            jsonBody: {
                results,
                total: filteredPrompts.length,
                query: query || null,
                filters: {
                    department,
                    tags,
                    complexity
                }
            }
        };
    } catch (error) {
        context.error('Error in searchPrompts:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

app.http('searchPrompts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts/search',
    handler: searchPrompts
});
