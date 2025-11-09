package com.fintrack.transactions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDTO {
    private String id;
    private String userId;
    private LocalDate date;
    private String description;
    private String category;
    private BigDecimal amount;
    private String type; // INCOME or EXPENSE
    private String accountId;
    private String notes;
    private String merchantName;

    // Default constructor
    public TransactionDTO() {
    }

    // Full constructor
    public TransactionDTO(String id, String userId, LocalDate date, String description, 
                         String category, BigDecimal amount, String type, String accountId, 
                         String notes, String merchantName) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.description = description;
        this.category = category;
        this.amount = amount;
        this.type = type;
        this.accountId = accountId;
        this.notes = notes;
        this.merchantName = merchantName;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }

    @Override
    public String toString() {
        return "TransactionDTO{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", date=" + date +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", amount=" + amount +
                ", type='" + type + '\'' +
                ", accountId='" + accountId + '\'' +
                ", notes='" + notes + '\'' +
                ", merchantName='" + merchantName + '\'' +
                '}';
    }
}