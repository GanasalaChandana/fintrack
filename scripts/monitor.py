#!/usr/bin/env python3
"""
FinTrack Service Monitor
Continuously monitors all services and displays status
"""

import requests
import time
import os
from datetime import datetime
from typing import Dict, List

# Service URLs
SERVICES = {
    "API Gateway": "http://localhost:8000",
    "ML Classifier": "http://localhost:8005",
    "Transactions": "http://localhost:8001",
    "Reports": "http://localhost:8002",
    "Alerts": "http://localhost:8003",
    "Users": "http://localhost:8004",
}

# Colors for terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def check_service_health(name: str, url: str) -> Dict:
    """Check health of a single service"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            return {
                "name": name,
                "status": "healthy",
                "response_time": response.elapsed.total_seconds() * 1000,
                "url": url
            }
        else:
            return {
                "name": name,
                "status": "unhealthy",
                "response_time": None,
                "url": url,
                "error": f"Status code: {response.status_code}"
            }
    except requests.exceptions.ConnectionError:
        return {
            "name": name,
            "status": "unreachable",
            "response_time": None,
            "url": url,
            "error": "Connection refused"
        }
    except requests.exceptions.Timeout:
        return {
            "name": name,
            "status": "timeout",
            "response_time": None,
            "url": url,
            "error": "Request timeout"
        }
    except Exception as e:
        return {
            "name": name,
            "status": "error",
            "response_time": None,
            "url": url,
            "error": str(e)
        }

def get_status_color(status: str) -> str:
    """Get color based on status"""
    if status == "healthy":
        return Colors.GREEN
    elif status in ["unhealthy", "error"]:
        return Colors.RED
    elif status == "timeout":
        return Colors.YELLOW
    else:
        return Colors.RED

def display_status(results: List[Dict]):
    """Display service status in a formatted table"""
    clear_screen()
    
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("🚀 FinTrack Service Monitor")
    print("=" * 80)
    print(f"{Colors.RESET}")
    print(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Header
    print(f"{Colors.BOLD}{'Service':<20} {'Status':<15} {'Response Time':<15} {'URL':<30}{Colors.RESET}")
    print("-" * 80)
    
    # Service rows
    healthy_count = 0
    for result in results:
        color = get_status_color(result['status'])
        status = result['status'].upper()
        response_time = f"{result['response_time']:.2f}ms" if result['response_time'] else "N/A"
        
        print(f"{result['name']:<20} {color}{status:<15}{Colors.RESET} {response_time:<15} {result['url']:<30}")
        
        if result['status'] == "healthy":
            healthy_count += 1
        
        if 'error' in result:
            print(f"  └─ {Colors.RED}Error: {result['error']}{Colors.RESET}")
    
    print("-" * 80)
    print()
    
    # Summary
    total = len(results)
    health_percentage = (healthy_count / total * 100) if total > 0 else 0
    
    summary_color = Colors.GREEN if health_percentage >= 80 else Colors.YELLOW if health_percentage >= 50 else Colors.RED
    
    print(f"{Colors.BOLD}Summary:{Colors.RESET}")
    print(f"  Total Services: {total}")
    print(f"  {Colors.GREEN}Healthy: {healthy_count}{Colors.RESET}")
    print(f"  {Colors.RED}Unhealthy: {total - healthy_count}{Colors.RESET}")
    print(f"  {summary_color}Health: {health_percentage:.1f}%{Colors.RESET}")
    print()
    
    # Recommendations
    if healthy_count < total:
        print(f"{Colors.YELLOW}⚠️  Some services are down. Recommendations:{Colors.RESET}")
        print("  1. Check Docker containers: docker-compose ps")
        print("  2. View logs: docker-compose logs -f [service-name]")
        print("  3. Restart services: docker-compose restart")
        print()
    
    print(f"{Colors.BLUE}Press Ctrl+C to exit{Colors.RESET}")

def test_integration():
    """Test basic integration between services"""
    print("\n" + "=" * 80)
    print(f"{Colors.BOLD}🧪 Testing Integration{Colors.RESET}")
    print("=" * 80 + "\n")
    
    # Test 1: ML Classification
    try:
        print("Test 1: ML Classification... ", end="")
        response = requests.post(
            f"{SERVICES['ML Classifier']}/classify",
            json={
                "description": "Test transaction",
                "amount": 50.00,
                "merchant": "Test"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET} (Category: {data.get('category', 'N/A')})")
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET} (Status: {response.status_code})")
    except Exception as e:
        print(f"{Colors.RED}✗ ERROR{Colors.RESET} ({str(e)})")
    
    # Test 2: API Gateway Health Check
    try:
        print("Test 2: API Gateway Health... ", end="")
        response = requests.get(f"{SERVICES['API Gateway']}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            service_count = len(data.get('services', {}))
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET} ({service_count} services registered)")
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}✗ ERROR{Colors.RESET} ({str(e)})")
    
    # Test 3: Database Connection (through any service)
    try:
        print("Test 3: Database Connection... ", end="")
        # This assumes services have a /health endpoint that checks DB
        response = requests.get(f"{SERVICES['Transactions']}/health", timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ PASS{Colors.RESET}")
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}✗ ERROR{Colors.RESET} ({str(e)})")
    
    print()

def monitor_continuously(interval: int = 5):
    """Continuously monitor services"""
    print(f"{Colors.BOLD}Starting continuous monitoring (refresh every {interval}s)...{Colors.RESET}\n")
    time.sleep(2)
    
    try:
        while True:
            results = []
            for name, url in SERVICES.items():
                result = check_service_health(name, url)
                results.append(result)
            
            display_status(results)
            time.sleep(interval)
    
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Monitoring stopped.{Colors.RESET}\n")

def main():
    """Main function"""
    import sys
    
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("🚀 FinTrack Service Monitor")
    print("=" * 80)
    print(f"{Colors.RESET}\n")
    
    # Check if services are running
    print("Checking services...")
    results = []
    for name, url in SERVICES.items():
        result = check_service_health(name, url)
        results.append(result)
    
    display_status(results)
    
    # Run integration tests
    if "--test" in sys.argv:
        test_integration()
        return
    
    # Start continuous monitoring
    if "--once" not in sys.argv:
        print(f"\n{Colors.YELLOW}Starting continuous monitoring...{Colors.RESET}")
        time.sleep(2)
        monitor_continuously(interval=5)
    else:
        print(f"\n{Colors.BLUE}Single check complete. Use without --once for continuous monitoring.{Colors.RESET}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Monitor stopped by user.{Colors.RESET}\n")
        exit(0)