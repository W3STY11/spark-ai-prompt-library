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
exports.getPromptsByDepartment = getPromptsByDepartment;
const functions_1 = require("@azure/functions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEPARTMENT_ICONS = {
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
async function getPromptsByDepartment(request, context) {
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
    }
    catch (error) {
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
functions_1.app.http('getPromptsByDepartment', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'departments/{departmentName}/prompts',
    handler: getPromptsByDepartment
});
