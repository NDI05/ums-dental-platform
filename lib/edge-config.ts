export const EdgeConfig = {
    // Feature Flags
    ENABLE_QUIZ: true,
    ENABLE_LEADERBOARD: true,
    MAINTENANCE_MODE: false,

    // Performance Settings
    CACHE_TTL: 60, // seconds
    STALE_WHILE_REVALIDATE: 600,

    // Global Announcements (Static to avoid DB hit)
    ANNOUNCEMENT: {
        active: false,
        message: "Selamat datang di Healthkathon 2025!",
        type: "info" // info, warning, alert
    }
};

export function getEdgeConfig() {
    // In a real scenario, this would read from @vercel/edge-config
    // For now, it returns a static object instantly.
    return EdgeConfig;
}
