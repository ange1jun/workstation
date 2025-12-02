// src/components/RainbowLoader.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';

const RainbowLoader = () => {
    const location = useLocation();
    const theme = useTheme();

    const [isVisible, setIsVisible] = useState(false);
    const [restartKey, setRestartKey] = useState(0);

    const duration = 1400;

    useEffect(() => {
        setRestartKey(prev => prev + 1);
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [location]);

    if (!isVisible) return null;

    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            key={restartKey}
            sx={{
                width: '100%',
                height: '1px',
                position: 'relative',
                overflow: 'visible',
                zIndex: 9999,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                pointerEvents: 'none',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '0%',
                    background: isDark
                        ? 'linear-gradient(90deg, #B794F6 0%, #A78BFA 20%, #818CF8 40%, #60A5FA 60%, #34D399 80%, #FBBF24 100%)'
                        : 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 20%, #A855F7 40%, #EC4899 60%, #F43F5E 80%, #F97316 100%)',
                    willChange: 'width, opacity',
                    opacity: 0.9,
                    animation: `mainProgress ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    '@keyframes mainProgress': {
                        '0%': { width: '0%', opacity: 0.9 },
                        '100%': { width: '100%', opacity: 0.7 },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '-2px',
                    left: 0,
                    height: '5px',
                    width: '0%',
                    background: isDark
                        ? 'linear-gradient(90deg, rgba(183, 148, 246, 0.4) 0%, rgba(167, 139, 250, 0.35) 20%, rgba(129, 140, 248, 0.3) 40%, rgba(96, 165, 250, 0.25) 60%, rgba(52, 211, 153, 0.2) 80%, rgba(251, 191, 36, 0.15) 100%)'
                        : 'linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.25) 20%, rgba(168, 85, 247, 0.22) 40%, rgba(236, 72, 153, 0.2) 60%, rgba(244, 63, 94, 0.18) 80%, rgba(249, 115, 22, 0.15) 100%)',
                    filter: 'blur(8px)',
                    willChange: 'width',
                    animation: `topGlow ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    '@keyframes topGlow': {
                        '0%': { width: '0%' },
                        '100%': { width: '100%' },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '20%',
                    width: '2px',
                    height: '2px',
                    borderRadius: '50%',
                    background: isDark ? '#A78BFA' : '#ffffff',
                    boxShadow: isDark
                        ? '0 0 8px rgba(167, 139, 250, 0.8)'
                        : '0 0 6px rgba(139, 92, 246, 0.6)',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    willChange: 'transform, opacity',
                    animation: `particle1 ${duration}ms ease-out forwards`,
                    '@keyframes particle1': {
                        '0%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(0px) scale(0)'
                        },
                        '25%': {
                            opacity: 0.8,
                            transform: 'translate(-50%, -50%) translateY(-12px) scale(1.2)'
                        },
                        '50%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(-20px) scale(0.3)'
                        },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '45%',
                    width: '2.5px',
                    height: '2.5px',
                    borderRadius: '50%',
                    background: isDark ? '#60A5FA' : '#EC4899',
                    boxShadow: isDark
                        ? '0 0 10px rgba(96, 165, 250, 0.7)'
                        : '0 0 8px rgba(236, 72, 153, 0.5)',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    willChange: 'transform, opacity',
                    animation: `particle2 ${duration}ms ease-out 200ms forwards`,
                    '@keyframes particle2': {
                        '0%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(0px) scale(0)'
                        },
                        '28%': {
                            opacity: 0.9,
                            transform: 'translate(-50%, -50%) translateY(14px) scale(1.4)'
                        },
                        '56%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(24px) scale(0.4)'
                        },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '70%',
                    width: '2px',
                    height: '2px',
                    borderRadius: '50%',
                    background: isDark ? '#34D399' : '#F43F5E',
                    boxShadow: isDark
                        ? '0 0 9px rgba(52, 211, 153, 0.75)'
                        : '0 0 7px rgba(244, 63, 94, 0.55)',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    willChange: 'transform, opacity',
                    animation: `particle3 ${duration}ms ease-out 400ms forwards`,
                    '@keyframes particle3': {
                        '0%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(0px) scale(0)'
                        },
                        '22%': {
                            opacity: 0.85,
                            transform: 'translate(-50%, -50%) translateY(-16px) scale(1.3)'
                        },
                        '44%': {
                            opacity: 0,
                            transform: 'translate(-50%, -50%) translateY(-28px) scale(0.35)'
                        },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '-1px',
                    left: 0,
                    height: '3px',
                    width: '120px',
                    background: isDark
                        ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                    filter: 'blur(4px)',
                    opacity: 0,
                    willChange: 'left, opacity',
                    animation: `shimmer ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    '@keyframes shimmer': {
                        '0%': {
                            left: '-120px',
                            opacity: 0
                        },
                        '20%': {
                            opacity: 1
                        },
                        '80%': {
                            opacity: 0.9
                        },
                        '100%': {
                            left: '100%',
                            opacity: 0
                        },
                    },
                }}
            />

            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isDark
                        ? 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(251, 191, 36, 0.3) 50%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, rgba(249, 115, 22, 0.25) 50%, transparent 70%)',
                    transform: 'translate(0, -50%)',
                    opacity: 0,
                    willChange: 'transform, opacity',
                    animation: `endPulse ${duration}ms ease-out forwards`,
                    '@keyframes endPulse': {
                        '0%': {
                            opacity: 0,
                            transform: 'translate(0, -50%) scale(0.5)'
                        },
                        '88%': {
                            opacity: 0
                        },
                        '92%': {
                            opacity: 1,
                            transform: 'translate(0, -50%) scale(1)'
                        },
                        '96%': {
                            opacity: 0.6,
                            transform: 'translate(0, -50%) scale(1.8)'
                        },
                        '100%': {
                            opacity: 0,
                            transform: 'translate(0, -50%) scale(2.4)'
                        },
                    },
                }}
            />
        </Box>
    );
};

export default RainbowLoader;