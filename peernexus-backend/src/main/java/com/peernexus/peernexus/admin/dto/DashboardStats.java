package com.peernexus.peernexus.admin.dto;

import lombok.Builder;

/**
 * Summary statistics shown on the Admin Dashboard.
 *
 * @param totalUsers       number of registered users
 * @param totalDoubts      number of posted doubts
 * @param totalAnswers     number of posted answers
 * @param totalGroups      number of study groups
 * @param totalMessages    number of private chat messages
 * @param totalConnections number of accepted user connections
 * @param openReports      number of reports with status OPEN
 * @param resolvedReports  number of reports with status RESOLVED
 */
@Builder
public record DashboardStats(
        long totalUsers,
        long totalDoubts,
        long totalAnswers,
        long totalGroups,
        long totalMessages,
        long totalConnections,
        long openReports,
        long resolvedReports
) {}
