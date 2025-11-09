package com.fintrack.transactions.dto;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CsvTransactionRow {
    @CsvBindByName(column = "date")
    private String date;
    
    @CsvBindByName(column = "description")
    private String description;
    
    @CsvBindByName(column = "amount")
    private BigDecimal amount;
    
    @CsvBindByName(column = "merchant")
    private String merchant;
    
    @CsvBindByName(column = "category")
    private String category;
    
    @CsvBindByName(column = "type")
    private String type;
}