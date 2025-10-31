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

const DEPARTMENT_ICONS: Record<string, string> = {
    'Business': '💼',
    'Marketing': '📢',
    'Sales': '💰',
    'SEO': '🔍',
    'Finance': '💵',
    'Education': '📚',
    'Writing': '✍️',
    'Productivity': '⚡',
    'Solopreneurs': '🚀'
};

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

export async function getPromptsByDepartment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Getting prompts by department');

    try {
        const departmentName = request.params.departmentName;
        const subcategory = request.query.get('subcategory');

        if (!departmentName) {
            return {
                status: 400,
                jsonBody: {
                    error: 'Bad Request',
                    message: 'Department name is required'
                }
            };
        }

        const allPrompts = loadPrompts();

        // Filter by department
        let filteredPrompts = allPrompts.filter(p => p.department === departmentName);

        // Filter by subcategory if provided
        if (subcategory) {
            filteredPrompts = filteredPrompts.filter(p => p.subcategory === subcategory);
        }

        const prompts = filteredPrompts.map(prompt => ({
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
                departmentName,
                departmentIcon: DEPARTMENT_ICONS[departmentName] || '📁',
                promptCount: prompts.length,
                subcategory: subcategory || null,
                prompts
            }
        };
    } catch (error) {
        context.error('Error in getPromptsByDepartment:', error);
        return {
            status: 500,
            jsonBody: {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}

app.http('getPromptsByDepartment', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'departments/{departmentName}/prompts',
    handler: getPromptsByDepartment
});
