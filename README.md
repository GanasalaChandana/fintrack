# FinTrack - Financial Tracking Microservices

A cloud-native financial tracking application built with Spring Boot microservices and Kubernetes.

##  Quick Start

### Prerequisites
- Docker Desktop
- Minikube
- kubectl
- PowerShell

### Deploy to Local Kubernetes
```powershell
# One-command deployment
.\scripts\deploy-local.ps1
```

##  Architecture

### Microservices
- **Reports Service** - Financial reports and analytics
- **Alerts Service** - Notification management *(coming soon)*
- **Transactions Service** - Transaction processing *(coming soon)*
- **Users Service** - User management *(coming soon)*

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Kubernetes** - Container orchestration
- **GitHub Actions** - CI/CD pipeline

##  Current Status

 **Stage 1: Kubernetes Setup** - Complete  
 **Stage 2: Application Deployed** - Complete  
 **Stage 3: CI/CD Pipeline** - Complete  

### Running Services
- Reports Service: http://localhost:30084
- PostgreSQL: Internal (postgres:5432)
- Redis: Internal (redis:6379)

##  Testing

### Run Tests
```powershell
cd backend/reports-service
mvn test
```

### Performance Testing
```powershell
k6 run tests/performance/load-test.js
```

##  Documentation

- [CI/CD Pipeline Usage](docs/CI_CD_USAGE.md)
- [API Documentation](docs/API.md) *(coming soon)*
- [Architecture Guide](docs/ARCHITECTURE.md) *(coming soon)*

##  Development

### Build Docker Image
```powershell
docker build -t fintrack-reports-service:latest -f backend/reports-service/Dockerfile .
```

### Deploy to Kubernetes
```powershell
kubectl apply -f infra/k8s/base/
```

### View Logs
```powershell
kubectl logs -n fintrack -l app=reports-service --tail=50
```

##  Next Steps

- [ ] Add monitoring with Prometheus & Grafana
- [ ] Implement auto-scaling
- [ ] Add more microservices
- [ ] Set up service mesh (Istio)
- [ ] Add distributed tracing

##  License

MIT License - See LICENSE file for details
