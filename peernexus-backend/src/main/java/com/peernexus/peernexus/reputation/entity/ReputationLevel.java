package com.peernexus.peernexus.reputation.entity;

public enum ReputationLevel {
    BEGINNER(0),
    CONTRIBUTOR(100),
    MENTOR(300),
    EXPERT(700),
    LEGEND(1500);

    private final int minPoints;

    ReputationLevel(int minPoints) {
        this.minPoints = minPoints;
    }

    public int getMinPoints() {
        return minPoints;
    }

    public static ReputationLevel fromPoints(int points) {
        ReputationLevel current = BEGINNER;
        for (ReputationLevel level : values()) {
            if (points >= level.minPoints) {
                current = level;
            }
        }
        return current;
    }
}
