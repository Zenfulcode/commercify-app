# Commercify Go Demo

A modern e-commerce admin dashboard built with SvelteKit, showcasing integration with the Commercify API platform. This application provides a comprehensive interface for managing products, categories, orders, and customer data.

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5.x-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## 🚀 Features

- **Product Management**: Create, update, and organize product catalogs
- **Category Management**: Hierarchical category structure with advanced organization
- **Order Processing**: Real-time order management and fulfillment tracking
- **Customer Management**: Comprehensive customer data and interaction history
- **Analytics Dashboard**: Key performance metrics and business insights
- **Responsive Design**: Modern, mobile-first UI with dark/light mode support
- **Health Monitoring**: Built-in health checks and API diagnostics
- **Docker Support**: Production-ready containerization

## 🛠 Tech Stack

- **Frontend**: SvelteKit 5.x with TypeScript
- **Styling**: TailwindCSS 4.x with custom component library
- **UI Components**: Custom component library with accessibility features
- **API Client**: Type-safe Commercify API integration
- **Development**: Vite for fast development and building
- **Package Manager**: Bun for lightning-fast package management
- **Containerization**: Docker with multi-stage builds

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (latest version) - [Install Bun](https://bun.sh/docs/installation)
- **Docker** (optional, for containerized deployment)
- **Git**

## 🏃‍♂️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd commercify-go-app
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Configuration

Copy the example environment file and configure your API endpoints:

```bash
cp .env.example .env
```

### 4. Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Start development server with hot reload |
| `bun run build`       | Build production application             |
| `bun run preview`     | Preview production build locally         |
| `bun run check`       | Run type checking                        |
| `bun run check:watch` | Run type checking in watch mode          |
| `bun run format`      | Format code with Prettier                |
| `bun run lint`        | Check code formatting                    |

## 🐳 Docker Deployment

### Quick Docker Setup

1. **Build the image:**

```bash
docker build -t commercify-go-app .
```

2. **Run the container:**

```bash
docker run -p 3000:3000 \
  -e API_BASE_URL_DEV=http://localhost:6091/api \
  -e API_BASE_URL_PROD=https://api.commercify.com/v1 \
  commercify-go-app
```

### Using Docker Compose

For easier management, use Docker Compose:

```bash
# Production
docker-compose up -d

# Development
docker-compose --profile dev up -d
```

## 📁 Project Structure

```
commercify-go-app/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   │   └── ui/             # Base UI component library
│   │   ├── server/             # Server-side utilities
│   │   │   ├── api/            # API clients and utilities
│   │   │   └── env.ts          # Environment configuration
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils.ts            # Shared utilities
│   ├── routes/                 # SvelteKit routes
│   │   ├── +layout.svelte      # Root layout
│   │   ├── +page.svelte        # Home page
│   │   └── health/             # Health check endpoints
│   └── app.html                # HTML template
├── static/                     # Static assets
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Production Docker image
├── Dockerfile.dev              # Development Docker image
└── package.json               # Project configuration
```

## 🔌 API Integration

The application integrates with the Commercify API platform:

### Key Features:

- **Type-safe API client** with full TypeScript support
- **Automatic error handling** with retry logic
- **Environment-based configuration** for dev/prod endpoints
- **Request/response validation** using Zod schemas
- **Built-in authentication** with token management

### Example Usage:

```typescript
import { commercify } from '$lib/server/api/commercify';

// Fetch products
const products = await commercify.searchProducts({
	page: 1,
	page_size: 20,
	search: 'laptop'
});

// Create a new product
const newProduct = await commercify.createProduct({
	name: 'New Product',
	description: 'Product description',
	price: 99.99
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting: `bun run check && bun run lint`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

**Built with ❤️ using SvelteKit and the Commercify API**
