.PHONY: help db-start db-stop db-restart db-logs db-clean migrate-up migrate-down seed-data build run test clean docker-build docker-build-tag docker-push docker-build-push

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'


# Docker image commands
docker-build: ## Build Docker image
	docker build -t ghcr.io/zenfulcode/commercify-app:latest .

docker-build-tag: ## Build Docker image with specific tag (use TAG=version)
	@if [ -z "$(TAG)" ]; then echo "Error: TAG is required. Use: make docker-build-tag TAG=v1.0.0"; exit 1; fi
	docker build -t ghcr.io/zenfulcode/commercify-app:$(TAG) -t ghcr.io/zenfulcode/commercify-app:latest -t ghcr.io/zenfulcode/commercify-app:dev .

docker-push: ## Push Docker image to registry (use REGISTRY and TAG)
	@if [ -z "$(REGISTRY)" ]; then echo "Error: REGISTRY is required. Use: make docker-push REGISTRY=your-registry.com"; exit 1; fi
	@if [ -z "$(TAG)" ]; then echo "Error: TAG is required. Use: make docker-push REGISTRY=your-registry.com TAG=v1.0.0"; exit 1; fi
	docker push $(REGISTRY)/commercify-app:$(TAG)
	docker push $(REGISTRY)/commercify-app:latest
	docker push $(REGISTRY)/commercify-app:dev

docker-build-push: docker-build-tag docker-push ## Build and push Docker image (use REGISTRY and TAG)

docker-dev-build: ## Build Docker image for development
	docker build -t ghcr.io/zenfulcode/commercify-app:dev .

# PUSH NEW DOCKER IMAGE
# make docker-build-push REGISTRY=ghcr.io/zenfulcode TAG=v1.1-dev 