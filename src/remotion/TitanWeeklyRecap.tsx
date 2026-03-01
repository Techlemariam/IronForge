import { useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';
import { z } from 'zod';

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
const AnimatedNumber: React.FC<{ value: number; frame: number; delay: number }> = ({
    value, frame, delay,
}) => {
    const progress = interpolate(frame - delay, [0, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return <>{Math.round(value * progress).toLocaleString()}</>;
};

// ─── Stat Card ────────────────────────────────────────────
const StatCard: React.FC<{
    label: string;
    value: number;
    suffix?: string;
    color: string;
    frame: number;
    delay: number;
}> = ({ label, value, suffix, color, frame, delay }) => {
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
            style={{
                opacity,
                transform: `translateY(${y}px)`,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px 32px',
                minWidth: '200px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{ fontSize: '48px', fontWeight: 800, color, fontFamily: 'Inter, sans-serif' }}>
                <AnimatedNumber value={value} frame={frame} delay={delay} />
                {suffix && <span style={{ fontSize: '32px', opacity: 0.7 }}>{suffix}</span>}
            </div>
            <div
                style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginTop: '8px',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                {label}
            </div>
        </div>
    );
};

// ─── Main Composition ─────────────────────────────────────
export const TitanWeeklyRecap: React.FC<TitanRecapProps> = ({
    username,
    weekNumber,
    strengthGains,
    xpEarned,
    workoutsLogged,
    monstersDefeated,
    streakDays,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Background pulse
    const pulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.02, 0.06]);

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
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: `radial-gradient(ellipse at 50% 40%, rgba(74, 222, 128, ${pulse}) 0%, #0a0a0a 70%)`,
                color: 'white',
                fontFamily: 'Inter, system-ui, sans-serif',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Decorative grid lines */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Title Block */}
            <Sequence from={0} durationInFrames={150}>
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        textAlign: 'center',
                        opacity: titleOpacity,
                        transform: `scale(${titleScale})`,
                    }}
                >
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '6px',
                            marginBottom: '12px',
                        }}
                    >
                        ⚔️ Titan Weekly Recap
                    </div>
                    <h1
                        style={{
                            fontSize: '64px',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            margin: 0,
                            lineHeight: 1.1,
                        }}
                    >
                        {username}
                    </h1>
                    <div
                        style={{
                            opacity: subtitleOpacity,
                            fontSize: '24px',
                            color: 'rgba(255,255,255,0.6)',
                            marginTop: '8px',
                        }}
                    >
                        Vecka {weekNumber}
                    </div>
                </div>
            </Sequence>

            {/* Stats Grid */}
            <Sequence from={0} durationInFrames={150}>
                <div
                    style={{
                        position: 'absolute',
                        top: '45%',
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        maxWidth: '1100px',
                    }}
                >
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
                        style={{
                            position: 'absolute',
                            bottom: '10%',
                            opacity: streakOpacity,
                            transform: `scale(${streakScale})`,
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))',
                            border: '1px solid rgba(245,158,11,0.3)',
                            borderRadius: '100px',
                            padding: '16px 40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ fontSize: '36px' }}>🔥</span>
                        <span style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>
                            {streakDays}-dagars streak!
                        </span>
                    </div>
                </Sequence>
            )}
        </div>
    );
};
