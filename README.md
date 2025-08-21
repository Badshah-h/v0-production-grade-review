# AxonStreamAI - AI Orchestration Platform

*Production-grade AI orchestration system with modular monorepo architecture*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/haroons-projects-74f93423/v0-production-grade-review)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/pJxySW2PPGU)

## Overview

AxonStreamAI is a production-grade AI orchestration platform that enables users to create, manage, and deploy AI agents through an intuitive interface. The system features a modular monorepo architecture with separate frontend and backend applications, shared packages, and comprehensive tooling for enterprise deployment.

## Architecture

### Monorepo Structure
\`\`\`
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Fastify backend API
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── database/     # Database models and connection
│   ├── config/       # Shared configuration
│   ├── utils/        # Shared utilities
│   └── schemas/      # Validation schemas
├── scripts/          # Database migrations and setup
└── docker/           # Docker configuration
\`\`\`

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Node.js, Fastify, TypeScript
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with HTTP-only cookies, RBAC
- **Build System**: Turbo (monorepo orchestration), pnpm workspaces
- **Deployment**: Docker, Docker Compose

## Features

### Core Functionality
- **Multi-tenant Architecture**: Organization-scoped data isolation
- **Agent Builder**: Form-based wizard for creating AI agents
- **Tool Management**: Integration with external APIs and services
- **Real-time Chat**: WebSocket-based communication with AI agents
- **Admin Dashboard**: Comprehensive system monitoring and user management
- **Widget Deployment**: Embeddable chat widgets for websites

### Security & Compliance
- **Authentication**: JWT-based with secure HTTP-only cookies
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encrypted passwords with bcrypt
- **Session Management**: Secure session handling with expiration
- **Multi-tenancy**: Complete data isolation between organizations

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database
- Docker (optional)

### Environment Variables
Create `.env` files in the respective applications:

**Root `.env`:**
\`\`\`bash
DATABASE_URL=postgresql://username:password@localhost:5432/axonstream
JWT_SECRET=your-super-secret-jwt-key
\`\`\`

**Apps/Web `.env.local`:**
\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

### Installation & Setup
\`\`\`bash
# Install dependencies
pnpm install

# Setup database
pnpm run db:migrate

# Start development servers
pnpm run dev

# Or start individual apps
pnpm run dev:web    # Frontend on http://localhost:3000
pnpm run dev:api    # Backend on http://localhost:3001
\`\`\`

### Docker Deployment
\`\`\`bash
# Build and start all services
pnpm run docker:build
pnpm run docker:up

# Stop services
pnpm run docker:down
\`\`\`

## Development

### Available Scripts
- `pnpm run dev` - Start all applications in development mode
- `pnpm run build` - Build all applications for production
- `pnpm run lint` - Run linting across all packages
- `pnpm run type-check` - Run TypeScript type checking
- `pnpm run clean` - Clean all build artifacts and node_modules

### Database Management
\`\`\`bash
# Run initial migration
pnpm run db:migrate

# Connect to database (requires psql)
psql $DATABASE_URL
\`\`\`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Agent Management
- `GET /api/agents` - List user's agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Chat System
- `POST /api/chat/:agentId` - Send message to agent
- `GET /api/chat/:agentId/history` - Get chat history

## Deployment

### Production Environment
1. Set up PostgreSQL database
2. Configure environment variables
3. Build applications: `pnpm run build`
4. Deploy using Docker or your preferred hosting platform

### Vercel Deployment
The frontend can be deployed to Vercel with automatic builds from this repository.

**Live Demo**: [https://vercel.com/haroons-projects-74f93423/v0-production-grade-review](https://vercel.com/haroons-projects-74f93423/v0-production-grade-review)

## Contributing

This project follows enterprise development practices:
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Conventional commits for version control
- Comprehensive error handling and logging

## License

This project is proprietary software developed for production use.

---

**Continue building**: [https://v0.app/chat/projects/pJxySW2PPGU](https://v0.app/chat/projects/pJxySW2PPGU)
