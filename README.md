# Commercify Go Demo

A modern e-commerce admin dashboard built with SvelteKit, showcasing integration with the Commercify API platform. This application provides a comprehensive interface for managing products, categories, orders, and customer data.

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
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
cd commercify-go-demo
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

Edit `.env` and update the API URLs:

```bash
# Development API URL
API_BASE_URL_DEV=http://localhost:6091/api

# Production API URL
API_BASE_URL_PROD=https://api.commercify.com/v1
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
docker build -t commercify-go-demo .
```

2. **Run the container:**

```bash
docker run -p 3000:3000 \
  -e API_BASE_URL_DEV=http://localhost:6091/api \
  -e API_BASE_URL_PROD=https://api.commercify.com/v1 \
  commercify-go-demo
```

### Using Docker Compose

For easier management, use Docker Compose:

```bash
# Production
docker-compose up -d

# Development
docker-compose --profile dev up -d
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md).

## 🏥 Health Monitoring

The application includes comprehensive health checking:

### Basic Health Check

```bash
curl http://localhost:5173/health
```

### Detailed Diagnostics

```bash
curl http://localhost:5173/health?detailed=true
```

The detailed health check provides:

- API connectivity tests
- Environment variable validation
- Database connection status
- Performance metrics
- Configuration diagnostics

## 📁 Project Structure

```
commercify-go-demo/
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

## 🎨 UI Components

The application includes a comprehensive component library:

### Core Components:

- **Dialog**: Modal dialogs with accessibility
- **Dropdown Menu**: Context menus and dropdowns
- **Tabs**: Tab navigation components
- **Switch**: Toggle switches
- **Textarea**: Enhanced text areas
- **Sonner**: Toast notifications

### Usage Example:

```svelte
<script>
	import { Dialog, Button } from '$lib/components/ui';
</script>

<Dialog.Root>
	<Dialog.Trigger asChild let:builder>
		<Button builders={[builder]}>Open Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Dialog Title</Dialog.Title>
		</Dialog.Header>
		<!-- Dialog content -->
	</Dialog.Content>
</Dialog.Root>
```

## 🛡️ Environment Variables

| Variable            | Description              | Default                         |
| ------------------- | ------------------------ | ------------------------------- |
| `API_BASE_URL_DEV`  | Development API endpoint | `http://localhost:6091/api`     |
| `API_BASE_URL_PROD` | Production API endpoint  | `https://api.commercify.com/v1` |
| `NODE_ENV`          | Environment mode         | `development`                   |
| `PORT`              | Server port (production) | `3000`                          |
| `HOST`              | Server host (production) | `0.0.0.0`                       |

## 🔍 Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**

   - Ensure `.env` file exists in the project root
   - Check that variables are properly formatted
   - Restart the development server after changes

2. **API Connection Failures**

   - Verify API endpoints are correct
   - Check network connectivity
   - Use health check endpoint for diagnostics: `/health?detailed=true`

3. **Build Errors**

   - Clear node_modules and reinstall: `rm -rf node_modules && bun install`
   - Check TypeScript errors: `bun run check`
   - Ensure all dependencies are installed

4. **Docker Issues**
   - Verify environment variables are passed to container
   - Check Docker logs: `docker logs <container-id>`
   - Ensure proper port mapping

### Getting Help:

- Check the health endpoint: `http://localhost:5173/health?detailed=true`
- Review Docker logs for containerized deployments
- Ensure all environment variables are properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting: `bun run check && bun run lint`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#🔍-troubleshooting)
2. Review the health check diagnostics
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🚀 Deployment

### Production Deployment

1. **Build the application:**

```bash
bun run build
```

2. **Configure environment variables for production**

3. **Deploy using Docker:**

```bash
docker build -t commercify-go-demo .
docker run -p 3000:3000 commercify-go-demo
```

### Environment-Specific Configuration

- **Development**: Uses `API_BASE_URL_DEV` for local API server
- **Production**: Uses `API_BASE_URL_PROD` for production API endpoint
- **Docker**: Environment variables can be passed via Docker Compose or container run commands

---

**Built with ❤️ using SvelteKit and the Commercify API platform**
