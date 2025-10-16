package com.fintrack.transactions.service;

import com.fintrack.transactions.dto.CreateTransactionRequest;
import com.fintrack.transactions.dto.CsvTransactionRow;
import com.fintrack.transactions.dto.TransactionDto;
import com.fintrack.transactions.entity.Transaction;
import com.fintrack.transactions.event.TransactionCreatedEvent;
import com.fintrack.transactions.kafka.KafkaProducerService;
import com.fintrack.transactions.repository.TransactionRepository;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final KafkaProducerService kafkaProducerService;
    
    @Transactional
    public TransactionDto createTransaction(CreateTransactionRequest request) {
        Transaction transaction = Transaction.builder()
                .userId(request.getUserId())
                .amount(request.getAmount())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate())
                .category(request.getCategory())
                .merchant(request.getMerchant())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();
        
        transaction = transactionRepository.save(transaction);
        log.info("Transaction created: {}", transaction.getId());
        
        // Publish Kafka event
        TransactionCreatedEvent event = TransactionCreatedEvent.builder()
                .transactionId(transaction.getId())
                .userId(transaction.getUserId())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .merchant(transaction.getMerchant())
                .paymentMethod(transaction.getPaymentMethod())
                .build();
        
        kafkaProducerService.publishTransactionCreated(event);
        
        return mapToDto(transaction);
    }
    
@Transactional
public List<TransactionDto> uploadCsv(UUID userId, MultipartFile file) {
    List<TransactionDto> createdTransactions = new ArrayList<>();
    
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
        String line;
        boolean isFirstLine = true;
        
        while ((line = reader.readLine()) != null) {
            if (isFirstLine) {
                isFirstLine = false;
                continue; // Skip header
            }
            
            String[] fields = line.split(",");
            if (fields.length < 6) {
                log.warn("Skipping invalid line: {}", line);
                continue;
            }
            
            try {
                Transaction transaction = Transaction.builder()
                        .userId(userId)
                        .transactionDate(java.time.LocalDate.parse(fields[0].trim()))
                        .amount(new java.math.BigDecimal(fields[1].trim()))
                        .description(fields[2].trim())
                        .merchant(fields[3].trim())
                        .category(fields[4].trim())
                        .paymentMethod(fields[5].trim())
                        .build();
                
                transaction = transactionRepository.save(transaction);
                
                TransactionCreatedEvent event = TransactionCreatedEvent.builder()
                        .transactionId(transaction.getId())
                        .userId(transaction.getUserId())
                        .amount(transaction.getAmount())
                        .description(transaction.getDescription())
                        .transactionDate(transaction.getTransactionDate())
                        .merchant(transaction.getMerchant())
                        .paymentMethod(transaction.getPaymentMethod())
                        .build();
                
                kafkaProducerService.publishTransactionCreated(event);
                createdTransactions.add(mapToDto(transaction));
            } catch (Exception e) {
                log.warn("Skipping invalid row: {}", e.getMessage());
            }
        }
        
        log.info("Successfully uploaded {} transactions", createdTransactions.size());
        
    } catch (Exception e) {
        log.error("Error processing CSV file", e);
        throw new RuntimeException("Failed to process CSV file: " + e.getMessage());
    }
    
    return createdTransactions;
}
    
    @Transactional(readOnly = true)
    public Page<TransactionDto> getUserTransactions(UUID userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(this::mapToDto);
    }
    
    @Transactional(readOnly = true)
    public TransactionDto getTransaction(UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
        return mapToDto(transaction);
    }
    
    private TransactionDto mapToDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .userId(transaction.getUserId())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .category(transaction.getCategory())
                .merchant(transaction.getMerchant())
                .paymentMethod(transaction.getPaymentMethod())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}