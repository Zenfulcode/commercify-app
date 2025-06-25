# Docker Deployment Guide

This guide explains how to build and run the Commercify Go Demo application using Docker.

## Prerequisites

- Docker
- Docker Compose (optional, for easier management)

## Building the Application

### Production Build

Build the production Docker image:

```bash
docker build -t commercify-go-demo .
```

### Development Build

Build the development Docker image:

```bash
docker build -f Dockerfile.dev -t commercify-go-demo:dev .
```

## Running the Application

### Using Docker directly

#### Production

```bash
docker run -p 3000:3000 commercify-go-demo
```

The application will be available at `http://localhost:3000`

#### Development

```bash
docker run -p 5173:5173 -v $(pwd):/app commercify-go-demo:dev
```

The development server will be available at `http://localhost:5173`

### Using Docker Compose

#### Production

```bash
docker-compose up commercify-app
```

#### Development

```bash
docker-compose --profile dev up commercify-dev
```

Or run both:

```bash
docker-compose --profile dev up
```

## Environment Variables

You can pass environment variables to customize the application:

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  commercify-go-demo
```

## Health Check

The application includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-25T14:52:00.000Z",
  "service": "commercify-go-demo",
  "version": "0.0.1"
}
```

## Multi-stage Build

The production Dockerfile uses a multi-stage build to:

1. **Build Stage**: Install dependencies and build the application
2. **Production Stage**: Copy only the built application and production dependencies

This results in a smaller, more secure production image.

## Security Features

- Runs as non-root user (`sveltekit`)
- Uses slim base image for production
- Excludes development dependencies in production
- Includes health checks

## Troubleshooting

### Port Issues

If port 3000 is already in use, map to a different port:

```bash
docker run -p 8080:3000 commercify-go-demo
```

### Build Issues

If you encounter build issues, try building without cache:

```bash
docker build --no-cache -t commercify-go-demo .
```

### Logs

View container logs:

```bash
docker logs <container-id>
```

### Interactive Shell

Access the container shell for debugging:

```bash
docker run -it --entrypoint /bin/sh commercify-go-demo
```
