export type Status = {
    version: string;
    server: string;
    session: {
        boot: Date;
        uptime: string;
    },
    s3: {
        uploads: string;
        downloads: string;
        stored: string;
    },
    debug: {
        memory: {
            used: string;
            process: {
                rss: string;
                heapTotal: string;
                heapUsed: string;
                external: string;
                arrayBuffers: string;
                heap: string;
            }
        },
        storage: {
            total: string;
            used: string;
            free: string;
        }
    }
}