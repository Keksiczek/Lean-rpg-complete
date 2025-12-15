import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, AdminRole } from '../types';
import { useAuth } from './AuthContext';

interface AdminContextType {
  role: AdminRole;
  hasPermission: (requiredRole: AdminRole) => boolean;
  isAdmin: boolean;
  isAuditManager: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Hierarchy of roles for simple permission checking (index based)
const ROLE_HIERARCHY = [
  AdminRole.OPERATOR,
  AdminRole.TRAINER,
  AdminRole.AUDIT_MANAGER,
  AdminRole.TENANT_ADMIN,
  AdminRole.SUPER_ADMIN
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>(AdminRole.OPERATOR);

  useEffect(() => {
    if (user) {
      // Map string role from DB to Enum, fallback to OPERATOR
      const userRole = (user.role as AdminRole) || AdminRole.OPERATOR;
      setRole(userRole);
    } else {
      setRole(AdminRole.OPERATOR);
    }
  }, [user]);

  const hasPermission = (requiredRole: AdminRole): boolean => {
    const userLevel = ROLE_HIERARCHY.indexOf(role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
    return userLevel >= requiredLevel;
  };

  const isAdmin = hasPermission(AdminRole.TENANT_ADMIN);
  const isAuditManager = hasPermission(AdminRole.AUDIT_MANAGER);

  return (
    <AdminContext.Provider value={{ role, hasPermission, isAdmin, isAuditManager }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
