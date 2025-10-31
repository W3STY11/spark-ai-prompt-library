import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as fs from 'fs';
import * as path from 'path';

interface Prompt {
    id: string;
    title: string;
    description: string;
    department: string;
    subcategory: string;
    icon: string;
    complexity: string;
    tags: string;
    word_count: number;
}

interface PromptsData {
    prompts: Prompt[];
}

// In-memory storage for favorites (in production, use a database)
const userFavorites = new Map<string, Set<string>>();

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

function getUserId(request: HttpRequest): string {
    // In production, extract from authentication token
    // For now, use a header or generate a session ID
    return request.headers.get('x-user-id') || 'anonymous';
}

export async function getUserFavorites(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Getting user favorites');

    try {
        const userId = getUserId(request);
        const favoriteIds = userFavorites.get(userId) || new Set();
        const allPrompts = loadPrompts();

        const results = allPrompts
            .filter(prompt => favoriteIds.has(prompt.id))
            .map(prompt => ({
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
                count: results.length
            }
        };
    } catch (error) {
        context.error('Error in getUserFavorites:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

export async function addToFavorites(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Adding prompt to favorites');

    try {
        const userId = getUserId(request);
        const body = await request.json() as any;
        const promptId = body?.promptId;

        if (!promptId) {
            return {
                status: 400,
                jsonBody: {
                    error: 'Bad Request',
                    message: 'promptId is required'
                }
            };
        }

        // Verify prompt exists
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

        // Add to favorites
        if (!userFavorites.has(userId)) {
            userFavorites.set(userId, new Set());
        }
        userFavorites.get(userId)!.add(promptId);

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            jsonBody: {
                message: 'Added to favorites',
                promptTitle: prompt.title,
                success: true
            }
        };
    } catch (error) {
        context.error('Error in addToFavorites:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

app.http('getUserFavorites', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users/me/favorites',
    handler: getUserFavorites
});

app.http('addToFavorites', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'users/me/favorites',
    handler: addToFavorites
});
