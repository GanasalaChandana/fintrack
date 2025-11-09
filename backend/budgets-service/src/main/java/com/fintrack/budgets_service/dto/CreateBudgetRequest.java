package com.fintrack.budgets_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateBudgetRequest {
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Period is required")
    @Pattern(regexp = "MONTHLY|WEEKLY|YEARLY", message = "Period must be MONTHLY, WEEKLY, or YEARLY")
    private String period;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;
    
    @Min(value = 1, message = "Alert threshold must be between 1 and 100")
    @Max(value = 100, message = "Alert threshold must be between 1 and 100")
    private Integer alertThreshold = 80;
}
