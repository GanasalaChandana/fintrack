package com.fintrack.transactions.dto;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvDate;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CsvTransactionRow {
    
    @CsvBindByName(column = "date")
    @CsvDate(value = "yyyy-MM-dd")
    private String dateStr;
    
    @CsvBindByName(column = "amount")
    private String amountStr;
    
    @CsvBindByName(column = "description")
    private String description;
    
    @CsvBindByName(column = "merchant")
    private String merchant;
    
    @CsvBindByName(column = "category")
    private String category;
    
    @CsvBindByName(column = "payment_method")
    private String paymentMethod;
    
    // Getters for parsed values
    public LocalDate getDate() {
        return dateStr != null ? LocalDate.parse(dateStr) : null;
    }
    
    public BigDecimal getAmount() {
        return amountStr != null ? new BigDecimal(amountStr) : null;
    }
}