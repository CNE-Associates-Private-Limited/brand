.PHONY: help install build test lint typecheck format clean quality
help: ## show targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*##/\t/'
install: ## install dependencies
	pnpm install --frozen-lockfile
build: ## build tokens, assets and icons into dist/
	pnpm build
test: ## contrast and token hygiene tests
	pnpm test
lint: ## biome
	pnpm lint
typecheck: ## syntax-check the build scripts
	pnpm typecheck
format: ## format with biome
	pnpm format
quality: lint typecheck test ## everything CI runs
clean: ## remove generated output
	rm -rf dist
