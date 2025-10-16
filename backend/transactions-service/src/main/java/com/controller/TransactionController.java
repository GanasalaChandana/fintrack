package com.fintrack.transactions.controller;

import com.fintrack.transactions.dto.CreateTransactionRequest;
import com.fintrack.transactions.dto.TransactionDto;
import com.fintrack.transactions.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tx")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {
    
    private final TransactionService transactionService;
    
    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        try {
            TransactionDto transaction = transactionService.createTransaction(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (Exception e) {
            log.error("Failed to create transaction", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadCsv(
            @RequestParam("userId") UUID userId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "File is empty"));
            }
            
            List<TransactionDto> transactions = transactionService.uploadCsv(userId, file);
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully uploaded " + transactions.size() + " transactions",
                    "count", transactions.size(),
                    "transactions", transactions
            ));
        } catch (Exception e) {
            log.error("Failed to upload CSV", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<TransactionDto>> getUserTransactions(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<TransactionDto> transactions = transactionService.getUserTransactions(userId, pageable);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(@PathVariable UUID id) {
        try {
            TransactionDto transaction = transactionService.getTransaction(id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            log.error("Failed to get transaction", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}