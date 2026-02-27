#!/usr/bin/env bash
# Build all FinTrack backend, frontend, and Docker images
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# Parse flags
SKIP_TESTS=false
SKIP_DOCKER=false
SKIP_FRONTEND=false
for arg in "$@"; do
    case $arg in
        --skip-tests|-s)  SKIP_TESTS=true ;;
        --skip-docker)    SKIP_DOCKER=true ;;
        --skip-frontend)  SKIP_FRONTEND=true ;;
    esac
done

echo ""
echo -e "${BLUE}🔨 FinTrack Build Pipeline${NC}"
log_info "Skip tests:    $SKIP_TESTS"
log_info "Skip Docker:   $SKIP_DOCKER"
log_info "Skip frontend: $SKIP_FRONTEND"

# ─── Backend ──────────────────────────────────────────────────────────────────
log_step "Backend (Maven)"
MVN_FLAGS="-q"
$SKIP_TESTS && MVN_FLAGS="$MVN_FLAGS -DskipTests"
cd "$PROJECT_ROOT/backend"
mvn clean package $MVN_FLAGS
log_info "Backend build complete ✓"

# ─── Frontend ─────────────────────────────────────────────────────────────────
if ! $SKIP_FRONTEND; then
    log_step "Frontend (Next.js)"
    if command -v npm &>/dev/null; then
        FRONTEND_DIR="$PROJECT_ROOT/frontend/web"
        if [ -d "$FRONTEND_DIR" ]; then
            cd "$FRONTEND_DIR"
            log_info "Installing npm dependencies..."
            npm ci --silent
            log_info "Building Next.js app..."
            npm run build
            log_info "Frontend build complete ✓"
        else
            log_warn "Frontend directory not found: $FRONTEND_DIR"
        fi
    else
        log_warn "npm not found, skipping frontend build"
    fi
fi

# ─── Docker ───────────────────────────────────────────────────────────────────
if ! $SKIP_DOCKER; then
    log_step "Docker Images"
    if command -v docker &>/dev/null; then
        SERVICES=(users-service transactions-service budgets-service alerts-service reports-service api-gateway)
        for service in "${SERVICES[@]}"; do
            SERVICE_DIR="$PROJECT_ROOT/backend/$service"
            if [ -f "$SERVICE_DIR/Dockerfile" ]; then
                log_info "  → fintrack/$service"
                docker build -t "fintrack/$service:latest" "$SERVICE_DIR" -q
            fi
        done
        log_info "  → fintrack/ml-classifier"
        docker build -t "fintrack/ml-classifier:latest" "$PROJECT_ROOT/ml-classifier" -q
        log_info "Docker images built ✓"
    else
        log_warn "Docker not found, skipping image builds"
    fi
fi

echo ""
log_info "✅ Build pipeline complete!"
