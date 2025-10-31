"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPrompts = searchPrompts;
const functions_1 = require("@azure/functions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load prompts data (in production, this would be from a database)
function loadPrompts() {
    try {
        const dataPath = path.join(process.cwd(), 'public', 'prompts_index.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);
        return data.prompts || [];
    }
    catch (error) {
        console.error('Error loading prompts:', error);
        return [];
    }
}
async function searchPrompts(request, context) {
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
    }
    catch (error) {
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
functions_1.app.http('searchPrompts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts/search',
    handler: searchPrompts
});
