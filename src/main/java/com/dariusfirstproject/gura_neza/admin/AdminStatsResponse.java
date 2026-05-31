package com.dariusfirstproject.gura_neza.admin;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AdminStatsResponse {
    private BigDecimal todayRevenue;
    private Long pendingOrdersCount;
    private Long totalUsersCount;
    private Long supportQueueCount;
}
