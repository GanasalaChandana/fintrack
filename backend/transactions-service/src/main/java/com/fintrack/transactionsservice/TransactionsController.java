package com.fintrack.transactionsservice;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tx")
public class TransactionsController {
    @GetMapping("/ping")
    public String ping() {
        return "tx-ok";
    }
}
