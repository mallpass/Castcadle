package com.castcadle.model;

import java.util.ArrayList;
import java.util.List;

public class UserGameData {
    private String userId;
    private int guessesLeft;
    private List<GameResult> gameHistory;
    
    // Maximum allowed guesses per day (for example, 6)
    public static final int MAX_GUESSES = 6;

    public UserGameData(String userId) {
        this.userId = userId;
        this.guessesLeft = MAX_GUESSES;
        this.gameHistory = new ArrayList<>();
    }

    // Getters and setters
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public int getGuessesLeft() {
        return guessesLeft;
    }
    public void setGuessesLeft(int guessesLeft) {
        this.guessesLeft = guessesLeft;
    }
    public List<GameResult> getGameHistory() {
        return gameHistory;
    }
    public void setGameHistory(List<GameResult> gameHistory) {
        this.gameHistory = gameHistory;
    }
}
