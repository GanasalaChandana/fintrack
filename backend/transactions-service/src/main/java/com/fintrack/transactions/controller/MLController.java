package com.fintrack.transactions.controller;

import com.fintrack.transactions.service.MLClassifierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLClassifierService mlClassifierService;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody Map<String, Object> request) {
        String description = (String) request.get("description");
        Double amount = ((Number) request.get("amount")).doubleValue();

        String category = mlClassifierService.predictCategory(description, amount);

        return ResponseEntity.ok(Map.of(
                "category", category,
                "confidence", 0.85 // You can enhance this
        ));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        return ResponseEntity.ok(mlClassifierService.getModelMetrics());
    }
}