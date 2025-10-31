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
    tips?: string;
    images?: string[];
}

interface PromptsData {
    prompts: Prompt[];
}

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

export async function getPrompt(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const promptId = request.params.promptId;

        if (!promptId) {
            return {
                status: 400,
                jsonBody: {
                    error: 'Bad Request',
                    message: 'Prompt ID is required'
                }
            };
        }

        const allPrompts = loadPrompts();
        const prompt = allPrompts.find(p => p.id === promptId);

        if (!prompt) {
            return {
                status: 404,
                jsonBody: {
                    error: 'Not Found',
                    message: `Prompt with ID '${promptId}' not found`
                }
            };
        }

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            jsonBody: prompt
        };
    } catch (error) {
        context.error('Error in getPrompt:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

app.http('getPrompt', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts/{promptId}',
    handler: getPrompt
});
