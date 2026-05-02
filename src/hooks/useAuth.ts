import { useSession } from "next-auth/react";
import { canDelete, canRead, canWrite } from "@/lib/rbac";
import type { Resource } from "@/types/rbac";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const role = session?.user.role;

  return {
    user: session?.user ?? null,
    role,
    isAuthenticated: status === "authenticated",
    loading: status === "loading",
    error: null,
    canView: (resource: Resource) => canRead(role, resource),
    canEdit: (resource: Resource) => canWrite(role, resource),
    canDelete: (resource: Resource) => canDelete(role, resource),
  };
};
