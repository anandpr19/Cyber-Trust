import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    target: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    target,
    duration = 2,
    suffix = '',
    prefix = '',
    className = ''
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let start = 0;
                    const step = target / (duration * 60);
                    const interval = setInterval(() => {
                        start += step;
                        if (start >= target) {
                            setCount(target);
                            clearInterval(interval);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 1000 / 60);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};
