export const getAdminBasePath = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  if (window.location.pathname.startsWith("/admin")) {
    return "/admin";
  }

  return process.env.NODE_ENV === "production" ? "/admin" : "";
};

export const toAdminPath = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = getAdminBasePath();

  if (!basePath) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return basePath;
  }

  if (
    normalizedPath.startsWith(`${basePath}/`) ||
    normalizedPath === basePath
  ) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
};
