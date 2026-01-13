// Application-wide constants

export const APP_NAME = 'Unihub.lk Admin';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  UNIVERSITIES: '/universities',
  COURSES: '/courses',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

export const USER_ROLES = {
  ADMIN: 'Admin',
  STUDENT: 'Student',
  STAFF: 'Staff',
} as const;

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
