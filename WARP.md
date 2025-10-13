# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

The `household-api` is a NestJS-based TypeScript API server following modern Node.js development practices. This is a fresh NestJS project initialized from the official TypeScript starter template.

### Technology Stack
- **Framework**: NestJS v11 (Node.js framework for building scalable server-side applications)
- **Language**: TypeScript with ES2023 target
- **Runtime**: Node.js (requires >= 20.11)
- **Testing**: Jest for unit tests, Supertest for e2e tests
- **Code Quality**: ESLint + Prettier with TypeScript-ESLint integration
- **Module System**: Node Next (nodenext) for modern ESM/CommonJS interoperability

## Architecture

### NestJS Structure
The project follows standard NestJS architecture patterns:

- **Modules** (`src/app.module.ts`): Root application module that imports and organizes the app's components
- **Controllers** (`src/app.controller.ts`): Handle HTTP requests and return responses, decorated with `@Controller()`
- **Services/Providers** (`src/app.service.ts`): Business logic layer, injectable classes decorated with `@Injectable()`
- **Main Bootstrap** (`src/main.ts`): Application entry point that creates and starts the NestJS application

### Key Configuration Files
- `nest-cli.json`: NestJS CLI configuration with source root in `src/`
- `tsconfig.json`: TypeScript config using nodenext modules with modern ES2023 target
- `eslint.config.mjs`: ESLint configuration using flat config format with TypeScript integration
- `.prettierrc`: Code formatting rules

## Common Development Commands

### Application Lifecycle
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run start:dev

# Production build
npm run build

# Run production build
npm run start:prod

# Run in debug mode
npm run start:debug
```

### Testing
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Lint and auto-fix code
npm run lint

# Format code with Prettier
npm run format
```

### Development Workflow
- Use `npm run start:dev` for local development - it includes hot reload
- Write unit tests alongside your code (`.spec.ts` files)
- E2E tests go in the `test/` directory
- Run `npm run lint` before committing to ensure code quality

### NestJS CLI Usage
The project includes `@nestjs/cli` as a dev dependency. Generate new resources with:
```bash
# Generate a new module
npx nest generate module [name]

# Generate a controller
npx nest generate controller [name]

# Generate a service
npx nest generate service [name]

# Generate a complete resource (module, controller, service)
npx nest generate resource [name]
```

## Project Structure Patterns

### Source Organization
- All source code lives in `src/`
- Tests are co-located with source files (`.spec.ts` extension)
- E2E tests are in the dedicated `test/` directory
- Build output goes to `dist/` directory

### TypeScript Configuration
- Uses `nodenext` module resolution for modern Node.js compatibility
- Strict null checks enabled but some strict options relaxed for flexibility
- Experimental decorators enabled for NestJS dependency injection
- Source maps generated for debugging

### Testing Strategy
- Unit tests use Jest with `ts-jest` for TypeScript support
- E2E tests use dedicated Jest config (`test/jest-e2e.json`)
- Tests are configured to run in Node environment
- Coverage reports generated to `coverage/` directory

## Development Environment

### Node.js Requirements
- **Minimum Version**: Node.js 20.11+ (as specified by NestJS 11)
- **Package Manager**: npm (package-lock.json present)

### Port Configuration
- Default development port: 3000
- Can be overridden with `PORT` environment variable

### Hot Reload
The development server (`npm run start:dev`) includes automatic restart on file changes, making development efficient.