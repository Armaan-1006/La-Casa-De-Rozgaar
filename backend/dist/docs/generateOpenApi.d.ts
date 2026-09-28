export declare const openApiSpec: {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
        contact: {
            name: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
                description: string;
            };
        };
        schemas: {
            ErrorResponse: {
                type: string;
                properties: {
                    error: {
                        type: string;
                        properties: {
                            code: {
                                type: string;
                                example: string;
                            };
                            message: {
                                type: string;
                                example: string;
                            };
                            requestId: {
                                type: string;
                                example: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            User: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    email: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                    isActive: {
                        type: string;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                    };
                };
            };
            CandidateProfile: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    userId: {
                        type: string;
                    };
                    firstName: {
                        type: string;
                    };
                    lastName: {
                        type: string;
                    };
                    headline: {
                        type: string;
                    };
                    bio: {
                        type: string;
                    };
                    location: {
                        type: string;
                    };
                    visibility: {
                        type: string;
                        enum: string[];
                    };
                    targetRoles: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    totalExperienceYears: {
                        type: string;
                    };
                };
            };
            SkillGap: {
                type: string;
                properties: {
                    skillId: {
                        type: string;
                    };
                    skillName: {
                        type: string;
                    };
                    currentScore: {
                        type: string;
                    };
                    requiredScore: {
                        type: string;
                    };
                    gap: {
                        type: string;
                    };
                    priority: {
                        type: string;
                        enum: string[];
                    };
                    marketDemand: {
                        type: string;
                    };
                    reason: {
                        type: string;
                    };
                };
            };
            JobMatch: {
                type: string;
                properties: {
                    jobId: {
                        type: string;
                    };
                    overallMatch: {
                        type: string;
                    };
                    skillMatch: {
                        type: string;
                    };
                    experienceMatch: {
                        type: string;
                    };
                    roleMatch: {
                        type: string;
                    };
                    locationMatch: {
                        type: string;
                    };
                    matchedSkills: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    missingSkills: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    explanation: {
                        type: string;
                    };
                };
            };
            SimulationResult: {
                type: string;
                properties: {
                    roleReadiness: {
                        type: string;
                    };
                    skillCoverage: {
                        type: string;
                    };
                    remainingGaps: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    compatibleJobsEstimate: {
                        type: string;
                        properties: {
                            total: {
                                type: string;
                            };
                            improvement: {
                                type: string;
                            };
                        };
                    };
                    learningRequirements: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                skillId: {
                                    type: string;
                                };
                                skillName: {
                                    type: string;
                                };
                                currentScore: {
                                    type: string;
                                };
                                targetScore: {
                                    type: string;
                                };
                                estimatedHours: {
                                    type: string;
                                };
                            };
                        };
                    };
                    disclaimer: {
                        type: string;
                    };
                };
            };
        };
    };
    security: {
        bearerAuth: never[];
    }[];
    paths: {
        '/health': {
            get: {
                summary: string;
                tags: string[];
                security: never[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/auth/register': {
            post: {
                summary: string;
                tags: string[];
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                    };
                                    name: {
                                        type: string;
                                    };
                                    role: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/auth/login': {
            post: {
                summary: string;
                tags: string[];
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                    password: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/auth/me': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/candidates/profile': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
            put: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/candidates/skills': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
            post: {
                summary: string;
                tags: string[];
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/assessments': {
            get: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/assessments/{id}/attempt': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/assessments/attempts/{attemptId}/answers': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/assessments/attempts/{attemptId}/integrity': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/assessments/attempts/{attemptId}/submit': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/skill-gaps/calculate': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    targetRoleId: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/matching/jobs/{jobId}': {
            post: {
                summary: string;
                tags: string[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/matching/jobs/recommended': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/simulation': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    targetRoleId: {
                                        type: string;
                                    };
                                    skillChanges: {
                                        type: string;
                                        items: {
                                            type: string;
                                            required: string[];
                                            properties: {
                                                skillId: {
                                                    type: string;
                                                };
                                                targetScore: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/learning/recommended': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/interviews/preparation': {
            get: {
                summary: string;
                tags: string[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    required?: undefined;
                })[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/research': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/recommendations/dashboard': {
            get: {
                summary: string;
                tags: string[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/talent/search': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    skills: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    roleId: {
                                        type: string;
                                    };
                                    minExperience: {
                                        type: string;
                                    };
                                    maxExperience: {
                                        type: string;
                                    };
                                    location: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/workforce/gaps/analyze': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    profileId: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/workforce/gaps/recommendation': {
            post: {
                summary: string;
                tags: string[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    profileId: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/compensation': {
            get: {
                summary: string;
                tags: string[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                    };
                    required?: undefined;
                })[];
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
    };
};
export declare function writeOpenApiFile(): void;
//# sourceMappingURL=generateOpenApi.d.ts.map