import type { Integration, EventProcessor, Hub, Event } from '@sentry/types';
export declare class ProfilingIntegration implements Integration {
    name: string;
    getCurrentHub?: () => Hub;
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
    handleGlobalEvent(event: Event): Event;
}
