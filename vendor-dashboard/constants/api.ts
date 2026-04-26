export const API_URL = "http://localhost:3000/api";
export const WEBHOOK_URL = "http://localhost:3000/webhooks";

export const VENDOR_ENDPOINTS = {
  login: "/vendor/auth/login",
  register: "/vendor/auth/register",
  profile: "/vendor/profile",
  products: "/vendor/products",
  orders: "/vendor/orders",
  analytics: "/vendor/analytics",
  notifications: "/vendor/notifications",
  chat: "/vendor/chat",
};

export const ORDER_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const NOTIFICATION_TYPES = {
  NEW_ORDER: "new_order",
  ORDER_STATUS: "order_status",
  PAYMENT: "payment",
  MESSAGE: "message",
  SYSTEM: "system",
};
