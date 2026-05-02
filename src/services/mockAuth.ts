import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/features/auth/auth.api";

interface MockUser extends User {
  password: string;
}

const mockUsers: MockUser[] = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "user-1",
    name: "Customer",
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
];

const toPublicUser = (user: MockUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createMockToken = (user: User) =>
  `mock.${btoa(JSON.stringify({ sub: user.id, role: user.role }))}`;

export async function mockLogin(data: LoginRequest): Promise<AuthResponse> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 300);
  });

  const user = mockUsers.find(
    (item) =>
      item.email.toLowerCase() === data.email.toLowerCase() &&
      item.password === data.password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const publicUser = toPublicUser(user);

  return {
    success: true,
    message: "Logged in successfully",
    accessToken: createMockToken(publicUser),
    user: publicUser,
  };
}

export async function mockRegister(
  data: RegisterRequest
): Promise<RegisterResponse> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 300);
  });

  if (mockUsers.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Email already registered");
  }

  const user: User = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: "user",
  };

  return {
    success: true,
    message: "User registered successfully",
    data: user,
  };
}
