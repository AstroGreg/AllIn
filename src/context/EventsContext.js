var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { ApiError, getSubscribedEvents } from '../services/apiGateway';
const EventsContext = createContext(undefined);
export const EventsProvider = ({ children }) => {
    const { apiAccessToken } = useAuth();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const refresh = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!apiAccessToken) {
            setEvents([]);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const res = yield getSubscribedEvents(apiAccessToken);
            const list = Array.isArray(res === null || res === void 0 ? void 0 : res.events) ? res.events : [];
            setEvents(list);
        }
        catch (e) {
            const message = e instanceof ApiError ? e.message : String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e);
            setError(message);
            setEvents([]);
        }
        finally {
            setIsLoading(false);
        }
    }), [apiAccessToken]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    const eventById = useCallback((eventId) => {
        if (!eventId)
            return undefined;
        return events.find((event) => String(event.event_id) === String(eventId));
    }, [events]);
    const eventNameById = useCallback((eventId) => {
        const match = eventById(eventId);
        return (match === null || match === void 0 ? void 0 : match.event_name) || (match === null || match === void 0 ? void 0 : match.event_title) || 'Event';
    }, [eventById]);
    const value = useMemo(() => ({ events, isLoading, error, refresh, eventNameById, eventById }), [events, isLoading, error, refresh, eventNameById, eventById]);
    return _jsx(EventsContext.Provider, Object.assign({ value: value }, { children: children }));
};
export const useEvents = () => {
    const ctx = useContext(EventsContext);
    if (!ctx)
        throw new Error('useEvents must be used within EventsProvider');
    return ctx;
};
