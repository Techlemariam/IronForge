import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';
import { z } from 'zod';
import styles from './TitanWeeklyRecap.module.css';

// ─── Schema ───────────────────────────────────────────────
export const titanRecapSchema = z.object({
    username: z.string(),
    weekNumber: z.number(),
    strengthGains: z.number(),
    xpEarned: z.number().default(0),
    workoutsLogged: z.number().default(0),
    monstersDefeated: z.number().default(0),
    streakDays: z.number().default(0),
});

type TitanRecapProps = z.infer<typeof titanRecapSchema>;

// ─── Animated Counter ─────────────────────────────────────
const AnimatedNumber = ({
    value, frame, delay,
}: { value: number; frame: number; delay: number }) => {
    const progress = interpolate(frame - delay, [0, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return <>{Math.round(value * progress).toLocaleString()}</>;
};

// ─── Stat Card ────────────────────────────────────────────
const StatCard = ({ label, value, suffix, color, frame, delay }: {
    label: string;
    value: number;
    suffix?: string;
    color: string;
    frame: number;
    delay: number;
}) => {
    const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const y = interpolate(frame - delay, [0, 15], [30, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            className={styles.statCard}
            style={{
                opacity,
                transform: `translateY(${y}px)`,
            } as React.CSSProperties}
        >
            <div className={styles.statValue} style={{ color }}>
                <AnimatedNumber value={value} frame={frame} delay={delay} />
                {suffix && <span className={styles.statSuffix}>{suffix}</span>}
            </div>
            <div className={styles.statLabel}>
                {label}
            </div>
        </div>
    );
};

// ─── Main Composition ─────────────────────────────────────
export const TitanWeeklyRecap = ({
    username,
    weekNumber,
    strengthGains,
    xpEarned,
    workoutsLogged,
    monstersDefeated,
    streakDays,
}: TitanRecapProps) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Background pulse
    const pulseOpacity = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.02, 0.06]);

    // Title animations
    const titleScale = spring({ frame, fps, config: { damping: 12 } });
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

    // Subtitle
    const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

    // Streak badge
    const streakOpacity = interpolate(frame, [100, 115], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    const streakScale = spring({ frame: Math.max(0, frame - 100), fps, config: { damping: 8 } });

    return (
        <div
            className={styles.container}
            style={{
                '--pulse-opacity': pulseOpacity,
            } as React.CSSProperties}
        >
            {/* Decorative grid lines */}
            <div className={styles.gridOverlay} />

            {/* Title Block */}
            <Sequence from={0} durationInFrames={150}>
                <div
                    className={styles.titleBlock}
                    style={{
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                    }}
                >
                    <div className={styles.recapLabel}>
                        ⚔️ Titan Weekly Recap
                    </div>
                    <h1 className={styles.username}>
                        {username}
                    </h1>
                    <div
                        className={styles.weekSub}
                        style={{
                            opacity: subtitleOpacity,
                        }}
                    >
                        Vecka {weekNumber}
                    </div>
                </div>
            </Sequence>

            {/* Stats Grid */}
            <Sequence from={0} durationInFrames={150}>
                <div className={styles.statsGrid}>
                    <StatCard label="Styrka" value={strengthGains} suffix="+" color="#4ade80" frame={frame} delay={40} />
                    <StatCard label="XP Earned" value={xpEarned} color="#22d3ee" frame={frame} delay={50} />
                    <StatCard label="Workouts" value={workoutsLogged} color="#f59e0b" frame={frame} delay={60} />
                    <StatCard label="Monsters" value={monstersDefeated} color="#ef4444" frame={frame} delay={70} />
                </div>
            </Sequence>

            {/* Streak Badge */}
            {streakDays > 0 && (
                <Sequence from={0} durationInFrames={150}>
                    <div
                        className={styles.streakBadge}
                        style={{
                            opacity: streakOpacity,
                            transform: `scale(${streakScale})`,
                        }}
                    >
                        <span className={styles.streakEmoji}>🔥</span>
                        <span className={styles.streakText}>
                            {streakDays}-dagars streak!
                        </span>
                    </div>
                </Sequence>
            )}
        </div>
    );
};
