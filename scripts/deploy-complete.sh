#!/usr/bin/env bash
# FinTrack Complete Deployment Pipeline: build → test → deploy
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

echo ""
echo -e "${BLUE}🚀 FinTrack Complete Deployment Pipeline${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Step 1: Build
log_info "Step 1/3: Building all services..."
bash "$SCRIPT_DIR/build-all-services.sh" --skip-tests
log_info "Build complete ✓"

# Step 2: Test
log_info "Step 2/3: Running tests..."
if bash "$SCRIPT_DIR/test-services.sh"; then
    log_info "Tests passed ✓"
else
    if $FORCE; then
        log_warn "Tests failed but --force flag set, continuing deployment..."
    else
        log_error "Tests failed. Use --force to deploy anyway."
        exit 1
    fi
fi

# Step 3: Deploy
log_info "Step 3/3: Deploying to Kubernetes..."
bash "$SCRIPT_DIR/deploy-local.sh"

echo ""
log_info "✅ Complete deployment pipeline finished!"
