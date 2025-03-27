package com.castcadle.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class GameResult {
    private LocalDate date;
    private String status; // "PASS", "FAIL", or "INCOMPLETE"
    private int guessesUsed;
    private List<Guess> guesses = new ArrayList<>();

    public GameResult(LocalDate date, String status, int guessesUsed) {
        this.date = date;
        this.status = status;
        this.guessesUsed = guessesUsed;
    }

    // Getters and setters
    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public int getGuessesUsed() {
        return guessesUsed;
    }
    public void setGuessesUsed(int guessesUsed) {
        this.guessesUsed = guessesUsed;
    }
    public List<Guess> getGuesses() {
        return guesses;
    }
    public void setGuesses(List<Guess> guesses) {
        this.guesses = guesses;
    }
}
