#!/usr/bin/env bash
# Run all tests for FinTrack services
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

FAILED=0

run_test() {
    local name="$1"; local cmd="$2"
    log_info "Running: $name"
    if eval "$cmd"; then
        log_info "✓ $name passed"
    else
        log_error "✗ $name FAILED"
        FAILED=$((FAILED + 1))
    fi
}

echo ""
echo -e "${BLUE}🧪 FinTrack Test Suite${NC}"
echo ""

# ─── Backend Unit Tests ───────────────────────────────────────────────────────
log_step "Backend Unit Tests (Maven)"
run_test "Maven test" "cd '$PROJECT_ROOT/backend' && mvn test -q 2>&1 | tail -30"

# ─── ML Classifier Tests ──────────────────────────────────────────────────────
log_step "ML Classifier Tests"
if command -v python3 &>/dev/null; then
    ML_DIR="$PROJECT_ROOT/ml-classifier"
    if [ -f "$ML_DIR/test_client.py" ]; then
        run_test "ML classifier tests" \
            "cd '$ML_DIR' && python3 -m pytest test_client.py -v 2>/dev/null || python3 test_client.py"
    else
        log_warn "No ML test file found, skipping"
    fi
else
    log_warn "python3 not found, skipping ML tests"
fi

# ─── Frontend Type Check ──────────────────────────────────────────────────────
log_step "Frontend Type Check"
FRONTEND_DIR="$PROJECT_ROOT/frontend/web"
if command -v npm &>/dev/null && [ -d "$FRONTEND_DIR" ]; then
    run_test "TypeScript type check" \
        "cd '$FRONTEND_DIR' && npx tsc --noEmit 2>&1 | head -50"
else
    log_warn "npm not found or frontend directory missing, skipping"
fi

# ─── Integration Tests ────────────────────────────────────────────────────────
log_step "Integration Tests"
if command -v python3 &>/dev/null && [ -f "$PROJECT_ROOT/tests/test_integration.py" ]; then
    run_test "Integration tests" "python3 '$PROJECT_ROOT/tests/test_integration.py'"
else
    log_warn "No integration tests found or python3 not available"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
if [ "$FAILED" -eq 0 ]; then
    log_info "✅ All tests passed!"
    exit 0
else
    log_error "❌ $FAILED test suite(s) FAILED"
    exit 1
fi
