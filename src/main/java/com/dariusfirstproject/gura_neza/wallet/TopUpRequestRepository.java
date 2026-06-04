package com.dariusfirstproject.gura_neza.wallet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopUpRequestRepository extends JpaRepository<TopUpRequestEntity, Long> {
    List<TopUpRequestEntity> findByUserId(Long userId);
    long countByStatus(TopUpRequestStatus status);
}
