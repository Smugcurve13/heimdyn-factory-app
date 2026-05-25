'use client'

import { useState } from 'react';
import { Bell, X, AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

type NotificationStatus = 'ongoing' | 'resolved';
type NotificationSeverity = 'critical' | 'warning' | 'success' | 'info';

interface Notification {
  id: string;
  title: string;
  machine: string;
  startedAgo: string;
  duration: string;
  status: NotificationStatus;
  severity: NotificationSeverity;
}

const dummyNotifications: Notification[] = [
  {
    id: '1',
    title: 'Press Machine 7 stopped',
    machine: 'Press-7',
    startedAgo: '46m ago',
    duration: '45m',
    status: 'ongoing',
    severity: 'critical',
  },
  {
    id: '2',
    title: 'Robotic Arm 2 low pressure',
    machine: 'Robot-2',
    startedAgo: '2h ago',
    duration: '2h 10m',
    status: 'ongoing',
    severity: 'warning',
  },
  {
    id: '3',
    title: 'Welding Cell 4 recovered',
    machine: 'Weld-4',
    startedAgo: '5h ago',
    duration: '',
    status: 'resolved',
    severity: 'success',
  },
  {
    id: '4',
    title: 'CNC-12 maintenance reminder',
    machine: 'CNC-12',
    startedAgo: '2d ago',
    duration: '',
    status: 'ongoing',
    severity: 'info',
  },
];

const getSeverityIcon = (severity: NotificationSeverity) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'info':
      return <Clock className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: NotificationSeverity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    case 'success':
      return 'bg-green-500';
    case 'info':
      return 'bg-blue-500';
  }
};

const getStatusDotColor = (severity: NotificationSeverity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    case 'success':
      return 'bg-green-500';
    case 'info':
      return 'bg-blue-500';
  }
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);

  const activeCount = notifications.filter(n => n.status === 'ongoing').length;
  const totalCount = notifications.length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Bell Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-12 w-12 rounded-full shadow-lg"
        variant="default"
        size="icon"
      >
        <Bell className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-[420px] shadow-2xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Downtime alerts</h3>
                <p className="text-sm text-muted-foreground">
                  {activeCount} active · {totalCount} total
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors"
              >
                {/* Status Dot */}
                <div className="mt-1">
                  <div className={`h-2 w-2 rounded-full ${getStatusDotColor(notification.severity)}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {notification.title}
                    </h4>
                    <Badge
                      className={`rounded-full h-6 w-6 p-0 flex items-center justify-center ${getSeverityColor(notification.severity)}`}
                    >
                      {getSeverityIcon(notification.severity)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.machine} · Started {notification.startedAgo}
                    {notification.duration && ` · Duration ${notification.duration}`}
                  </p>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={notification.status === 'ongoing' ? 'default' : 'secondary'}
                  className="ml-2 capitalize text-xs"
                >
                  {notification.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Showing latest {notifications.length} alerts
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
