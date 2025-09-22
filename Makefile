.DEFAULT_GOAL := sdk

# Configurable variables
PACKAGE_MANAGER ?= pnpm
ORVAL := $(PACKAGE_MANAGER) orval

SPEC_URL ?= http://localhost:3000/api-yaml
SDK_OUT ?= src/sdk

.PHONY: sdk sdk-watch clean-sdk

# Generate TypeScript SDK from OpenAPI spec using Orval
sdk:
	@echo "Generating TypeScript SDK from $(SPEC_URL) -> $(SDK_OUT)"
	@$(ORVAL) --config ./orval.config.js

# Watch mode: regenerate on spec changes
sdk-watch:
	@echo "Watching OpenAPI spec and regenerating SDK on changes..."
	@$(ORVAL) --input $(SPEC_URL) --output $(SDK_OUT) --client fetch --watch

# Clean generated SDK
sdk-clean:
	@echo "Removing generated SDK at $(SDK_OUT)"
	@rm -rf $(SDK_OUT)


