// Helper used by Jest to mock Prisma imports at require-time.
// This avoids failures when running backend unit tests from the repo root.

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}), { virtual: true });

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(),
}), { virtual: true });

// PrismaClient config uses pg Pool (require-time)
jest.mock('pg', () => ({
  Pool: jest.fn(),
}), { virtual: true });


