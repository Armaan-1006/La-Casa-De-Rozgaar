export declare class SchedulerService {
    private static instance;
    private timer;
    private isRunning;
    private lastRunDate;
    private ingestionService;
    private skillDemandAggregator;
    static getInstance(): SchedulerService;
    /**
     * Start in-process automated cron monitor
     */
    start(): void;
    stop(): void;
    private checkAndExecuteSchedule;
    /**
     * Run complete multi-source collection and market analytics pipeline
     */
    runFullSync(triggerSource?: string): Promise<{
        success: boolean;
        totalCollected: number;
        totalNew: number;
        totalDuplicates: number;
        sources: any[];
        skillsAggregated: number;
    }>;
}
//# sourceMappingURL=scheduler-service.d.ts.map