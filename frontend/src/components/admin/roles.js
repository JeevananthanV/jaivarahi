export const ROLES = ['Super Admin', 'Admin', 'Event Manager', 'Viewer'];
export const ROLE_LEVELS = { 'Super Admin': 4, 'Admin': 3, 'Event Manager': 2, 'Viewer': 1 };
export const isRole = (user, ...roles) => roles.includes(user?.role);
export const canMutate = (user) => user && user.role !== 'Viewer';