import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { isE2ELaunchEnabled } from '../../constants/E2EConfig';
const E2EPerfReady = ({ screen, ready, startedAtMs }) => {
    const [settled, setSettled] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(null);
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
    return (_jsx(Text, Object.assign({ testID: `e2e-perf-ready-${screen}`, style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            opacity: 0.01,
        } }, { children: `ready:${elapsedMs !== null && elapsedMs !== void 0 ? elapsedMs : 0}` })));
};
export default E2EPerfReady;
