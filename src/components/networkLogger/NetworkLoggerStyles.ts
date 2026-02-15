import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 9999,
  },
  fabText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 8,
    right: 8,
    bottom: 80,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 9998,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#16213E',
    borderBottomWidth: 1,
    borderBottomColor: '#0F3460',
  },
  headerTitle: {
    color: '#E94560',
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    color: '#E94560',
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  logItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A3E',
  },
  logItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 44,
    alignItems: 'center',
  },
  methodText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pathText: {
    flex: 1,
    color: '#CCC',
    fontSize: 12,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationText: {
    color: '#888',
    fontSize: 11,
  },
  expandedContainer: {
    marginTop: 8,
    backgroundColor: '#0D1117',
    borderRadius: 6,
    padding: 8,
  },
  expandedLabel: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  expandedValue: {
    color: '#8B949E',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: 4,
  },
  timeText: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
  },
});

export const METHOD_COLORS: Record<string, string> = {
  GET: '#61AFFE',
  POST: '#49CC90',
  PUT: '#FCA130',
  PATCH: '#E8A317',
  DELETE: '#F93E3E',
};

export const getStatusColor = (status: number | null): string => {
  if (status === null) return '#FF6B6B';
  if (status >= 200 && status < 300) return '#49CC90';
  if (status >= 300 && status < 400) return '#FCA130';
  return '#F93E3E';
};
