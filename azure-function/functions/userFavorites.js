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
exports.getUserFavorites = getUserFavorites;
exports.addToFavorites = addToFavorites;
const functions_1 = require("@azure/functions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// In-memory storage for favorites (in production, use a database)
const userFavorites = new Map();
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
function getUserId(request) {
    // In production, extract from authentication token
    // For now, use a header or generate a session ID
    return request.headers.get('x-user-id') || 'anonymous';
}
async function getUserFavorites(request, context) {
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
    }
    catch (error) {
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
async function addToFavorites(request, context) {
    context.log('Adding prompt to favorites');
    try {
        const userId = getUserId(request);
        const body = await request.json();
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
        userFavorites.get(userId).add(promptId);
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
    }
    catch (error) {
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
functions_1.app.http('getUserFavorites', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users/me/favorites',
    handler: getUserFavorites
});
functions_1.app.http('addToFavorites', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'users/me/favorites',
    handler: addToFavorites
});
