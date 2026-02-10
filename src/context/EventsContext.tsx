import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { ApiError, getSubscribedEvents, SubscribedEvent } from '../services/apiGateway';

interface EventsContextValue {
  events: SubscribedEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  eventNameById: (eventId?: string | null) => string;
  eventById: (eventId?: string | null) => SubscribedEvent | undefined;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const { apiAccessToken } = useAuth();
  const [events, setEvents] = useState<SubscribedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!apiAccessToken) {
      setEvents([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await getSubscribedEvents(apiAccessToken);
      const list = Array.isArray(res?.events) ? res.events : [];
      setEvents(list);
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : String(e?.message ?? e);
      setError(message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiAccessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const eventById = useCallback(
    (eventId?: string | null) => {
      if (!eventId) return undefined;
      return events.find((event) => String(event.event_id) === String(eventId));
    },
    [events],
  );

  const eventNameById = useCallback(
    (eventId?: string | null) => {
      const match = eventById(eventId);
      return match?.event_name || match?.event_title || 'Event';
    },
    [eventById],
  );

  const value = useMemo(
    () => ({ events, isLoading, error, refresh, eventNameById, eventById }),
    [events, isLoading, error, refresh, eventNameById, eventById],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};
