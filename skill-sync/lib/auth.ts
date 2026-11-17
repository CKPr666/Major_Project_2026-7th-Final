export const AUTH_ROLES = ["Student", "Recruiter", "College/TPO"] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export type DBRole = "student" | "recruiter" | "college";

export const getDashboardRouteForRole = (role?: string) => {
  switch (role) {
    case "Recruiter":
    case "recruiter":
      return "/recruiter/dashboard";
    case "College/TPO":
    case "college":
      return "/admin/dashboard";
    default:
      return "/student/dashboard";
  }
};

export const normalizeRole = (input?: string): DBRole | null => {
  if (!input) return null;
  const v = input.toLowerCase();
  if (v.includes("student")) return "student";
  if (v.includes("recruiter")) return "recruiter";
  if (v.includes("college") || v.includes("tpo")) return "college";
  return null;
};

export const getAuthErrorMessage = (message?: string) => {
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (normalized.includes("duplicate") || normalized.includes("already registered") || normalized.includes("already a user")) {
    return "An account with that email already exists.";
  }

  if (normalized.includes("password") && normalized.includes("should be at least")) {
    return "Please choose a stronger password with at least 6 characters.";
  }

  if (normalized.includes("password")) {
    return "The provided password is incorrect or too weak.";
  }

  if (normalized.includes("invalid login credentials") || normalized.includes("wrong password") || normalized.includes("user not found")) {
    return "Email or password is incorrect.";
  }

  return message;
};
