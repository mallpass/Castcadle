package com.castcadle.model;

import java.util.Map;

public class Guess {
    private String name;
    private Map<String, String> feedback;

    public Guess(String name, Map<String, String> feedback) {
        this.name = name;
        this.feedback = feedback;
    }

    // Getters and setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Map<String, String> getFeedback() {
        return feedback;
    }
    public void setFeedback(Map<String, String> feedback) {
        this.feedback = feedback;
    }
}
