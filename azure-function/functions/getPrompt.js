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
exports.getPrompt = getPrompt;
const functions_1 = require("@azure/functions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
async function getPrompt(request, context) {
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
    }
    catch (error) {
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
functions_1.app.http('getPrompt', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'prompts/{promptId}',
    handler: getPrompt
});
