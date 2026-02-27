#!/usr/bin/env bash
# FinTrack Local Deployment Script
# Equivalent of deploy-local.ps1 for Linux/macOS
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ─── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

echo ""
echo -e "${BLUE}🚀 FinTrack Local Deployment${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""

# ─── Prerequisites ────────────────────────────────────────────────────────────
log_step "Checking Prerequisites"
MISSING=()
for cmd in kubectl minikube docker mvn; do
    if command -v "$cmd" &>/dev/null; then
        log_info "  ✓ $cmd found"
    else
        log_error "  ✗ $cmd NOT found"
        MISSING+=("$cmd")
    fi
done
if [ ${#MISSING[@]} -gt 0 ]; then
    log_error "Missing required tools: ${MISSING[*]}"
    log_error "Please install them and try again."
    exit 1
fi

# ─── Minikube ─────────────────────────────────────────────────────────────────
log_step "Starting Minikube"
if minikube status 2>/dev/null | grep -q "Running"; then
    log_info "Minikube already running ✓"
else
    log_info "Starting Minikube (4GB RAM, 2 CPUs)..."
    minikube start --memory=4096 --cpus=2 --driver=docker 2>/dev/null \
        || minikube start --memory=4096 --cpus=2
fi
eval "$(minikube docker-env)"
log_info "Docker env configured for Minikube ✓"

# ─── Build Java Services ──────────────────────────────────────────────────────
log_step "Building Backend Services"
log_info "Running Maven build (skipping tests)..."
cd "$PROJECT_ROOT/backend"
mvn clean package -DskipTests -q
log_info "Maven build complete ✓"

# ─── Build Docker Images ──────────────────────────────────────────────────────
log_step "Building Docker Images"
SERVICES=(users-service transactions-service budgets-service alerts-service reports-service api-gateway)
for service in "${SERVICES[@]}"; do
    SERVICE_DIR="$PROJECT_ROOT/backend/$service"
    if [ -f "$SERVICE_DIR/Dockerfile" ]; then
        log_info "  Building fintrack/$service..."
        docker build -t "fintrack/$service:latest" "$SERVICE_DIR" -q
    else
        log_warn "  No Dockerfile found for $service, skipping"
    fi
done

log_info "  Building fintrack/ml-classifier..."
docker build -t "fintrack/ml-classifier:latest" "$PROJECT_ROOT/ml-classifier" -q
log_info "Docker images built ✓"

# ─── Kubernetes Deployment ────────────────────────────────────────────────────
log_step "Deploying to Kubernetes"

# Create monitoring namespace
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f - 2>/dev/null || true

# Apply base manifests
log_info "Applying base K8s manifests..."
kubectl apply -f "$PROJECT_ROOT/infra/k8s/base/" 2>/dev/null \
    || log_warn "Some base manifests had errors (may be expected on first run)"

# Apply HPAs
log_info "Applying HPA manifests..."
for hpa in hpa-transactions.yaml hpa-reports.yaml hpa-api-gateway.yaml; do
    kubectl apply -f "$PROJECT_ROOT/infra/k8s/base/$hpa" 2>/dev/null || true
done

# Apply monitoring
log_info "Applying monitoring manifests..."
kubectl apply -f "$PROJECT_ROOT/infra/k8s/monitoring/" 2>/dev/null \
    || log_warn "Some monitoring manifests had errors"

log_info "Kubernetes deployment complete ✓"

# ─── Wait for Pods ────────────────────────────────────────────────────────────
log_step "Waiting for Pods"
log_info "Waiting up to 3 minutes for pods to be ready..."
kubectl wait --for=condition=ready pod --all --timeout=180s 2>/dev/null \
    || log_warn "Some pods may not be ready yet. Check with: kubectl get pods"

# ─── Status ───────────────────────────────────────────────────────────────────
log_step "Deployment Status"
echo ""
kubectl get pods
echo ""
kubectl get services
echo ""

MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "localhost")
echo ""
log_info "✅ FinTrack is running!"
echo ""
log_info "  API Gateway : http://$MINIKUBE_IP:30080"
log_info "  Grafana     : http://$MINIKUBE_IP:30030  (admin / fintrack-grafana-2024)"
log_info "  Prometheus  : http://$MINIKUBE_IP:30090"
echo ""
log_info "Tip: Run 'kubectl get hpa' to check autoscaling status"
