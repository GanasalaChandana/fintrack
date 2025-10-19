# CI/CD Pipeline - No Secrets Required

##  What This Pipeline Does

### On Every Push/PR:
1.  **Runs Tests** - Unit & integration tests
2.  **Code Quality** - Checkstyle, PMD, SpotBugs
3.  **Builds Docker Image** - Creates container
4.  **Security Scans** - Trivy for vulnerabilities
5.  **Dependency Check** - OWASP security check
6.  **Performance Tests** - k6 load testing

### Local Deployment

Deploy to your local Minikube cluster:
```powershell
# Deploy latest version
.\scripts\deploy-local.ps1

# Deploy specific version
.\scripts\deploy-local.ps1 -ImageTag "v1.2.3"
```

##  View Results

After each run, check:
- **Actions tab** in GitHub for pipeline status
- **Artifacts** for test reports and security scans
- **Summary** for quick overview

##  No Configuration Needed

This pipeline runs entirely on GitHub Actions runners - no secrets, no external services required!

##  Manual Testing

Test the health endpoint:
```powershell
# Get service URL
$serviceUrl = & "C:\Program Files\Kubernetes\Minikube\minikube.exe" service reports-service -n fintrack --url

# Test health endpoint
curl "$serviceUrl/actuator/health"
```

##  Run Performance Tests Locally
```powershell
# Install k6 (one-time setup)
choco install k6

# Run load test
k6 run tests/performance/load-test.js
```
