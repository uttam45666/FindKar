import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, AlertTriangle, CheckCircle, XCircle, Star, MessageCircle, Wrench, Truck, MapPin, Home, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../context/NotificationContext.jsx';

const iconMap = {
  'check-circle': CheckCircle, 'x-circle': XCircle, 'star': Star,
  'message-circle': MessageCircle, 'truck': Truck, 'map-pin': MapPin,
  'tool': Wrench, 'alert-triangle': AlertTriangle, 'home': Home,
  'shield': Shield, 'bell': Bell,
};

const NotificationPanel = ({ onClose }) => {
  const { notifications, markAllRead, markRead, fetchNotifications } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={panelRef} className="absolute right-4 top-16 w-96 bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden z-50 animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-heading font-semibold text-dark">Notifications</h3>
        <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
          <CheckCheck size={12} /> Mark all read
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted text-sm">No notifications yet</div>
        ) : notifications.map(n => {
          const Icon = iconMap[n.icon] || Bell;
          return (
            <div key={n._id} onClick={() => markRead(n._id)} className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-warm transition-colors ${!n.isRead ? 'bg-primary-light' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.isRead ? 'bg-primary/15' : 'bg-border'}`}>
                <Icon size={14} className={!n.isRead ? 'text-primary' : 'text-muted'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-dark' : 'text-dark/80'}`}>{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-muted/60 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;
