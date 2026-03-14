import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { isE2ELaunchEnabled } from '../../constants/E2EConfig';

type Props = {
    screen: string;
    ready: boolean;
    startedAtMs?: number;
};

const E2EPerfReady = ({ screen, ready, startedAtMs }: Props) => {
    const [settled, setSettled] = useState(false);
    const [elapsedMs, setElapsedMs] = useState<number | null>(null);

    useEffect(() => {
        if (!isE2ELaunchEnabled()) {
            setSettled(false);
            setElapsedMs(null);
            return;
        }
        if (!ready) {
            setSettled(false);
            setElapsedMs(null);
            return;
        }

        setElapsedMs(Math.max(0, Date.now() - Number(startedAtMs || Date.now())));
        setSettled(true);
    }, [ready]);

    if (!isE2ELaunchEnabled() || !settled) {
        return null;
    }

    return (
        <Text
            testID={`e2e-perf-ready-${screen}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1,
                height: 1,
                opacity: 0.01,
            }}
        >
            {`ready:${elapsedMs ?? 0}`}
        </Text>
    );
};

export default E2EPerfReady;
