---
description: How to set up and run OSV-Scanner for vulnerability scanning
---

# OSV-Scanner Setup

## Installation

### Option 1: Install via Homebrew (macOS)
```bash
brew install osv-scanner
```

### Option 2: Install via Go
```bash
go install github.com/google/osv-scanner/cmd/osv-scanner@latest
```

### Option 3: Download binary
Visit https://github.com/google/osv-scanner/releases and download for your OS.

## Usage

### Run security scan
```bash
npm run security:scan
```

### Output as JSON (for CI/CD)
```bash
npm run security:scan-json
```

### Output as SARIF (for GitHub/CodeQL integration)
```bash
npm run security:scan-sarif
```

## What it does

OSV-Scanner scans your `package-lock.json` for known vulnerabilities in:
- npm packages
- Direct dependencies
- Transitive dependencies

## CI/CD Integration

Add to your GitHub Actions:

```yaml
- name: Run OSV-Scanner
  run: |
    npm install -g osv-scanner
    osv-scanner scan --lockfile=package-lock.json --json > osv-results.json
```

## Pre-commit Integration (Optional)

To add security scanning to pre-commit hooks, edit `.githooks/pre-commit` and add:

```bash
echo "🔒 Running security scan..."
osv-scanner scan --lockfile=package-lock.json

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Security vulnerabilities found. Review before committing."
  echo "Run 'npm run security:scan' for details."
  # Note: This won't block commits, just warns. Change to 'exit 1' to block.
fi
```

## Updating Vulnerability Database

OSV-Scanner uses the live OSV database, so no local database updates needed.

## Ignoring False Positives

Create `osv-scanner.toml` in project root:

```toml
[[PackageOverrides]]
name = "package-name"
ecosystem = "npm"
ignore = true
reason = "False positive - not used in production"
```
