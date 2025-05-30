
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User, Eye } from "lucide-react";

interface RoleViewerProps {
  role: 'admin' | 'user' | 'viewer';
  className?: string;
}

const RoleViewer = ({ role, className = "" }: RoleViewerProps) => {
  const getRoleConfig = (role: 'admin' | 'user' | 'viewer') => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: ShieldCheck,
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'viewer':
        return {
          label: 'Viewer',
          icon: Eye,
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'user':
        return {
          label: 'User',
          icon: User,
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className} flex items-center gap-1 text-xs px-2 py-1`}
    >
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

export default RoleViewer;
