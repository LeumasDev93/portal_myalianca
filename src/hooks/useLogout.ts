import { useEffect, useRef, useState } from 'react';

export function useAutoLogout(logout: () => void) {
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        const startIdleTimer = () => {
            idleTimeoutRef.current = setTimeout(() => {
                startCountdownToLogout();
            }, 3 * 60 * 1000); // 5 minutos
        };

        const clearAllTimers = () => {
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
            if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };

        const resetAllTimers = () => {
            clearAllTimers();
            setCountdown(null);
            startIdleTimer();
        };

        const handleClick = () => {
            // Se o usuário clicar durante a contagem, cancela tudo e reinicia ciclo
            resetAllTimers();
        };

        const startCountdownToLogout = () => {
            let secondsLeft = 60;
            setCountdown(secondsLeft);

            countdownRef.current = setInterval(() => {
                secondsLeft -= 1;
                setCountdown(secondsLeft);
                if (secondsLeft <= 0) {
                    clearInterval(countdownRef.current!);
                }
            }, 1000);

            logoutTimeoutRef.current = setTimeout(() => {
                logout();
            }, 60 * 1000);
        };

        resetAllTimers();
        window.addEventListener('click', handleClick);

        return () => {
            clearAllTimers();
            window.removeEventListener('click', handleClick);
        };
    }, [logout]);

    return { countdown };
}
