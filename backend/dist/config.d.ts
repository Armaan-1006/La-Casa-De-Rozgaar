export declare const config: {
    readonly port: number;
    readonly host: string;
    readonly nodeEnv: string;
    readonly database: {
        readonly url: string;
        readonly path: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly intelligenceProvider: "mock" | "remote";
    readonly module1: {
        readonly apiUrl: string;
        readonly apiKey: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly cors: {
        readonly origin: string;
    };
    readonly assessment: {
        readonly maxDurationMinutes: number;
        readonly integrityThreshold: number;
    };
    readonly logLevel: string;
};
//# sourceMappingURL=config.d.ts.map