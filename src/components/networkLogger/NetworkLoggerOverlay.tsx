import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNetworkLogger } from '../../context/NetworkLoggerContext';
import { type NetworkLog } from '../../services/networkLogger';
import { styles, METHOD_COLORS, getStatusColor } from './NetworkLoggerStyles';

const truncateBody = (body: any): string => {
  if (body == null) return '—';
  const str = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  return str.length > 500 ? str.slice(0, 500) + '...' : str;
};

const formatTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
};

const LogItem: React.FC<{ item: NetworkLog }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.7}
    >
      <View style={styles.logItemRow}>
        <View style={[styles.methodBadge, { backgroundColor: METHOD_COLORS[item.method] || '#888' }]}>
          <Text style={styles.methodText}>{item.method}</Text>
        </View>
        <Text style={styles.pathText} numberOfLines={1}>{item.path}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status ?? 'ERR'}
        </Text>
        <Text style={styles.durationText}>{item.duration}ms</Text>
      </View>

      {item.error && !expanded && (
        <Text style={styles.errorText} numberOfLines={1}>{item.error}</Text>
      )}

      {expanded && (
        <View style={styles.expandedContainer}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.expandedLabel}>URL</Text>
          <Text style={styles.expandedValue} selectable>{item.url}</Text>

          {item.error && (
            <>
              <Text style={styles.expandedLabel}>ERROR</Text>
              <Text style={styles.errorText}>{item.error}</Text>
            </>
          )}

          <Text style={styles.expandedLabel}>REQUEST BODY</Text>
          <Text style={styles.expandedValue} selectable>
            {item.requestBody instanceof FormData ? '[FormData]' : truncateBody(item.requestBody)}
          </Text>

          <Text style={styles.expandedLabel}>RESPONSE</Text>
          <Text style={styles.expandedValue} selectable>{truncateBody(item.responseBody)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const NetworkLoggerOverlay: React.FC = () => {
  const { logs, visible, toggleVisible, clearLogs } = useNetworkLogger();

  const renderItem = useCallback(({ item }: { item: NetworkLog }) => (
    <LogItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: NetworkLog) => item.id, []);

  return (
    <>
      {/* Floating Action Button - always visible in dev */}
      <TouchableOpacity style={styles.fab} onPress={toggleVisible} activeOpacity={0.8}>
        <Text style={styles.fabText}>{'</>'}</Text>
        {logs.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{logs.length > 99 ? '99+' : logs.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Log Panel */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={toggleVisible}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Network Logs</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={clearLogs}>
                <Text style={styles.headerButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={toggleVisible}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={logs}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No network requests yet</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
};

export default NetworkLoggerOverlay;
