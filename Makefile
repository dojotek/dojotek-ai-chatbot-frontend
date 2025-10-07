.DEFAULT_GOAL := sdk

# Configurable variables
PACKAGE_MANAGER ?= pnpm
ORVAL := $(PACKAGE_MANAGER) orval

SPEC_URL ?= http://localhost:3000/api-yaml
SDK_OUT ?= src/sdk

.PHONY: sdk sdk-watch clean-sdk clean-yaml

# Generate TypeScript SDK from OpenAPI spec using Orval
sdk:
	@echo "Fetching OpenAPI spec from $(SPEC_URL)..."
	@curl -s $(SPEC_URL) -o dojotek-chatbot.yaml
	@echo "Generating TypeScript SDK from dojotek-chatbot.yaml -> $(SDK_OUT)"
	@$(ORVAL) --config ./orval.config.js

# Watch mode: regenerate on spec changes
sdk-watch:
	@echo "Fetching OpenAPI spec from $(SPEC_URL)..."
	@curl -s $(SPEC_URL) -o dojotek-chatbot.yaml
	@echo "Watching OpenAPI spec and regenerating SDK on changes..."
	@$(ORVAL) --config ./orval.config.js --watch

# Clean generated SDK
sdk-clean:
	@echo "Removing generated SDK at $(SDK_OUT)"
	@rm -rf $(SDK_OUT)

# Clean downloaded YAML file
clean-yaml:
	@echo "Removing downloaded YAML file"
	@rm -f dojotek-chatbot.yaml


