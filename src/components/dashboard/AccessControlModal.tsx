import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, UserCog, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccessControlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roles = [
  { id: "viewer", icon: User, label: "Viewer" },
  { id: "editor", icon: UserCog, label: "Editor" },
  { id: "admin", icon: ShieldCheck, label: "Admin" },
];

const permissions = [
  {
    id: "view",
    name: "View Dashboards",
    description: "Access to view analytics dashboards",
  },
  {
    id: "export",
    name: "Export Reports",
    description: "Generate and download PDF/Excel reports",
  },
  {
    id: "edit",
    name: "Edit Inspections",
    description: "Modify inspection data and results",
  },
  {
    id: "users",
    name: "User Management",
    description: "Add, modify, or remove user accounts",
  },
  {
    id: "settings",
    name: "System Settings",
    description: "Modify system configurations",
  },
];

export function AccessControlModal({ open, onOpenChange }: AccessControlModalProps) {
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [permissionStates, setPermissionStates] = useState({
    view: true,
    export: true,
    edit: false,
    users: false,
    settings: false,
  });

  const togglePermission = (id: string) => {
    setPermissionStates((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Access Control Settings</DialogTitle>
          <DialogDescription>Manage user permissions and access levels</DialogDescription>
        </DialogHeader>

        {/* Role Selector */}
        <div className="flex gap-2 my-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center p-4 border rounded-lg transition-colors",
                selectedRole === role.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted border-border"
              )}
            >
              <role.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{role.label}</span>
            </button>
          ))}
        </div>

        {/* Permissions List */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-start justify-between py-2 border-b last:border-0">
              <div className="flex-1 pr-4">
                <Label htmlFor={permission.id} className="text-sm font-medium">
                  {permission.name}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
              </div>
              <Switch
                id={permission.id}
                checked={permissionStates[permission.id as keyof typeof permissionStates]}
                onCheckedChange={() => togglePermission(permission.id)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
