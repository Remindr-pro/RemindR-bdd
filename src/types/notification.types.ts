export interface NotificationData {
  userId: string;
  reminderId?: string;
  notificationType: 'push' | 'email' | 'sms';
  title: string;
  message: string;
  fcmToken?: string;
  email?: string;
  phoneNumber?: string;
}

