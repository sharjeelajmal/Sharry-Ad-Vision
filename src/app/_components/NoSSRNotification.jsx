// components/NoSSRNotification.jsx
"use client";
import dynamic from 'next/dynamic';

const NotificationPopup = dynamic(() => import('./Alertmesage'), {
  ssr: false,
});

export default NotificationPopup;
