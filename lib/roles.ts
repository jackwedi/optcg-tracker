interface UserRoleMetadata {
  app_metadata?: {
    role?: unknown;
    roles?: unknown;
  };
  user_metadata?: {
    role?: unknown;
    roles?: unknown;
  };
}

function isAdminValue(value: unknown): boolean {
  return typeof value === "string" && value.toLowerCase() === "admin";
}

function hasAdminInArray(value: unknown): boolean {
  return Array.isArray(value) && value.some((item) => isAdminValue(item));
}

export function hasAdminRole(
  user: UserRoleMetadata | null | undefined,
): boolean {
  if (!user) {
    return false;
  }

  return (
    isAdminValue(user.app_metadata?.role) ||
    isAdminValue(user.user_metadata?.role) ||
    hasAdminInArray(user.app_metadata?.roles) ||
    hasAdminInArray(user.user_metadata?.roles)
  );
}

export function hasAdminRoleFromUnknown(user: unknown): boolean {
  if (!user || typeof user !== "object") {
    return false;
  }

  return hasAdminRole(user as UserRoleMetadata);
}
