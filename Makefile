.PHONY: help install dev build start test test-watch coverage lint lint-fix format format-check clean quality all

# Colors for output
BOLD := \033[1m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

##@ Help

help: ## Display this help message
	@echo "$(BOLD)TypeScript REST API$(NC) - Available Commands"
	@echo ""
	@echo "$(BOLD)Development:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E 'dev|install|clean' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Build & Run:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E 'build|start' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Testing:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E 'test|coverage' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Code Quality:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E 'lint|format|quality' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BOLD)Usage Examples:$(NC)"
	@echo "  $(YELLOW)make install$(NC)       # Install all dependencies"
	@echo "  $(YELLOW)make dev$(NC)           # Start development server"
	@echo "  $(YELLOW)make build$(NC)         # Build for production"
	@echo "  $(YELLOW)make test$(NC)          # Run all tests"
	@echo "  $(YELLOW)make quality$(NC)       # Run all quality checks"
	@echo "  $(YELLOW)make all$(NC)           # Install, build, test, lint"
	@echo ""

##@ Installation & Setup

install: ## Install all npm dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

clean: ## Remove build artifacts and node_modules
	@echo "$(BLUE)🗑️  Cleaning up...$(NC)"
	rm -rf dist coverage node_modules
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

##@ Development

dev: ## Start development server with hot reload
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	npm run dev

dev-build: ## Build in watch mode
	@echo "$(BLUE)👀 Building in watch mode...$(NC)"
	npx tsc --watch

##@ Build & Production

build: ## Compile TypeScript to JavaScript
	@echo "$(BLUE)🔨 Building project...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build complete$(NC)"

start: build ## Build and start production server
	@echo "$(BLUE)🚀 Starting production server...$(NC)"
	npm run start

##@ Testing

test: ## Run all tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	npm run test -- --coverage

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)👀 Running tests in watch mode...$(NC)"
	npm run test:watch

test-unit: ## Run only unit tests (no integration tests)
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	npm run test -- --testPathPattern='unit' --coverage

test-integration: ## Run only integration tests
	@echo "$(BLUE)🧪 Running integration tests...$(NC)"
	npm run test -- --testPathPattern='integration' --coverage

coverage: ## Generate and display test coverage report
	@echo "$(BLUE)📊 Generating coverage report...$(NC)"
	npm run test:coverage
	@echo "$(GREEN)✅ Coverage report generated$(NC)"

coverage-check: ## Check coverage meets thresholds
	@echo "$(BLUE)📊 Checking coverage thresholds...$(NC)"
	npm run test -- --coverage --failOnLow || echo "$(YELLOW)⚠️  Coverage below threshold$(NC)"

##@ Code Quality & Linting

lint: ## Lint TypeScript files
	@echo "$(BLUE)🔍 Linting code...$(NC)"
	npm run lint

lint-fix: ## Fix linting issues automatically
	@echo "$(BLUE)🔧 Fixing linting issues...$(NC)"
	npm run lint:fix
	@echo "$(GREEN)✅ Linting issues fixed$(NC)"

format: ## Format code with Prettier
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	npm run format
	@echo "$(GREEN)✅ Code formatted$(NC)"

format-check: ## Check code formatting
	@echo "$(BLUE)✨ Checking code formatting...$(NC)"
	npm run format:check

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)📘 Type checking...$(NC)"
	npx tsc --noEmit
	@echo "$(GREEN)✅ Type checking passed$(NC)"

##@ Combined Quality Checks

quality: lint format-check type-check ## Run all code quality checks
	@echo "$(GREEN)✅ All quality checks passed$(NC)"

quality-fix: lint-fix format type-check ## Fix issues and run checks
	@echo "$(GREEN)✅ Issues fixed and checked$(NC)"

##@ Comprehensive Commands

all: clean install build test quality ## Complete build: install, build, test, and lint
	@echo "$(GREEN)✅ All tasks completed successfully$(NC)"

check: test quality ## Run tests and quality checks
	@echo "$(GREEN)✅ All checks passed$(NC)"

pre-commit: lint-fix format test ## Run pre-commit checks
	@echo "$(GREEN)✅ Pre-commit checks passed$(NC)"

##@ Utilities

info: ## Display project information
	@echo "$(BOLD)Project Information$(NC)"
	@echo "  Name: TypeScript REST API"
	@echo "  Node: $$(node --version)"
	@echo "  NPM: $$(npm --version)"
	@echo "  TypeScript: $$(npx tsc --version)"
	@echo ""
	@echo "$(BOLD)Directory Structure$(NC)"
	@echo "  src/        - Source code"
	@echo "  tests/      - Test files"
	@echo "  dist/       - Compiled output"
	@echo "  coverage/   - Test coverage reports"

.PHONY: info

version: ## Show versions of key tools
	@echo "$(BOLD)Tool Versions$(NC)"
	@node --version
	@npm --version
	@npx tsc --version
	@npx eslint --version
	@npx jest --version

.PHONY: version

##@ Debugging

debug: ## Start dev server with debugging enabled
	@echo "$(BLUE)🐛 Starting debug mode...$(NC)"
	node --inspect-brk dist/index.js

debug-ts: ## Start dev server with TypeScript debugging
	@echo "$(BLUE)🐛 Starting TypeScript debug mode...$(NC)"
	node --inspect-brk ./node_modules/.bin/ts-node src/index.ts
