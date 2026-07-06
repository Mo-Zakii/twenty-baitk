import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { NOTIFICATIONS_FRONT_COMPONENT_ID } from 'src/constants/uuids';
import { postCoreGraphql } from 'src/utils/baitk-graphql.util';

type NotificationRow = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const panelStyle = {
  padding: 16,
  fontFamily: 'var(--t-font-family, Inter, sans-serif)',
  color: 'var(--t-font-color-primary)',
} as const;

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    const result = await postCoreGraphql<{
      baitkNotifications: { edges: { node: NotificationRow }[] };
    }>(`query LoadNotifications {
      baitkNotifications(first: 30, orderBy: [{ createdAt: Desc }]) {
        edges {
          node {
            id
            message
            isRead
            createdAt
          }
        }
      }
    }`);

    const rows = result.baitkNotifications.edges.map((edge) => edge.node);
    setNotifications(rows);
    setUnreadCount(rows.filter((row) => !row.isRead).length);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markAllRead = async () => {
    for (const notification of notifications.filter((row) => !row.isRead)) {
      await postCoreGraphql(
        `mutation MarkRead($id: UUID!) {
          updateBaitkNotification(id: $id, data: { isRead: true }) {
            id
          }
        }`,
        { id: notification.id },
      );
    }
    await load();
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <strong>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </strong>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            style={{
              fontSize: 12,
              padding: '4px 8px',
              border: '1px solid var(--t-border-color-medium)',
              borderRadius: 6,
              background: 'var(--t-background-primary)',
              cursor: 'pointer',
              color: 'var(--t-font-color-primary)',
            }}
          >
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p style={{ color: 'var(--t-font-color-secondary)', fontSize: 14 }}>
          No notifications yet
        </p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid var(--t-border-color-light)',
              background: notification.isRead
                ? 'transparent'
                : 'var(--t-background-transparent-blue)',
              fontSize: 14,
            }}
          >
            {notification.message}
          </div>
        ))
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: NOTIFICATIONS_FRONT_COMPONENT_ID,
  name: 'baitk-notifications-panel',
  component: NotificationsPanel,
});
