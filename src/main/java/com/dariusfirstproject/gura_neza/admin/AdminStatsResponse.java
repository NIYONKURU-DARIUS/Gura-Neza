package com.dariusfirstproject.gura_neza.admin;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponse {
    // KPI cards
    private BigDecimal todayRevenue;
    private BigDecimal totalRevenue;
    private Long pendingOrdersCount;
    private Long confirmedOrdersCount;
    private Long deliveredOrdersCount;
    private Long cancelledOrdersCount;
    private Long totalOrdersCount;
    private Long totalUsersCount;
    private Long supportQueueCount;
    private Long totalProductsCount;
    private Long lowStockCount;

    // Chart data — last 7 days revenue
    private List<DailyRevenue> revenueChart;

    // Chart data — orders by status
    private Map<String, Long> ordersByStatus;

    // Chart data — top 5 products by likes
    private List<ProductStat> topProducts;

    @Data
    @Builder
    public static class DailyRevenue {
        private String date;       // "Mon", "Tue", etc.
        private BigDecimal revenue;
        private Long orders;
    }

    @Data
    @Builder
    public static class ProductStat {
        private String name;
        private Integer likes;
        private Double rating;
        private Integer stock;
    }
}
