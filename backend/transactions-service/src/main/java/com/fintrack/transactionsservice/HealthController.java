package com.fintrack.transactionsservice;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.Map;
import java.util.HashMap;

@RestController
public class HealthController {
  @GetMapping("/actuator/health")
  public Map<String, String> health() {
    Map<String, String> m = new HashMap<>();
    m.put("status", "UP");
    return m;
  }
}
