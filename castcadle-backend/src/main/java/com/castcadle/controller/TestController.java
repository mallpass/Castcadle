package com.castcadle.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import com.castcadle.CastcadleBackendApplication;
import com.castcadle.data.PeopleData;
import com.castcadle.data.UserGameDataRepository;
import com.castcadle.model.Person;
import com.castcadle.model.GameResult;
import com.castcadle.model.UserGameData;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Castcadle!";
    }

    @PostMapping("/guess")
    public Map<String, String> handleGuess(@RequestBody Map<String, String> guessPayload) {
        String userId = guessPayload.get("userId");
        String guessedName = guessPayload.get("name");

        // Retrieve or initialize user game data
        UserGameData userData = UserGameDataRepository.getUserGameData(userId);
        LocalDate today = LocalDate.now();
        GameResult todayResult = userData.getGameHistory().stream()
            .filter(gr -> gr.getDate().equals(today))
            .findFirst()
            .orElse(null);
        if (todayResult == null) {
            todayResult = new GameResult(today, "INCOMPLETE", 0);
            userData.getGameHistory().add(todayResult);
        }

        // Prevent further guesses if the game is already complete for today
        if (todayResult.getStatus().equals("PASS") || todayResult.getStatus().equals("FAIL")) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Today's game is already completed.");
            response.put("gameStatus", todayResult.getStatus());
            return response;
        }

        // Check available guesses
        if (userData.getGuessesLeft() <= 0) {
            todayResult.setStatus("FAIL");
            Map<String, String> response = new HashMap<>();
            response.put("error", "No guesses left for today.");
            response.put("gameStatus", todayResult.getStatus());
            return response;
        }

        // Decrement guesses and record this guess
        userData.setGuessesLeft(userData.getGuessesLeft() - 1);
        todayResult.setGuessesUsed(todayResult.getGuessesUsed() + 1);

        // Retrieve the person of the day and the guessed person
        Person personOfTheDay = CastcadleBackendApplication.getPersonOfTheDay();
        Person guessedPerson = PeopleData.getPeople().stream()
                .filter(person -> person.getName().equalsIgnoreCase(guessedName))
                .findFirst()
                .orElse(null);

        Map<String, String> feedback = new HashMap<>();

        if (guessedPerson == null) {
            feedback.put("error", "Invalid guess: Person not found.");
            feedback.put("gameStatus", todayResult.getStatus());
            return feedback;
        }

        boolean correctGuess = guessedPerson.getName().equals(personOfTheDay.getName());
        feedback.put("name", correctGuess ? "Correct" : "Incorrect");
        feedback.put("gender", guessedPerson.getGender().equals(personOfTheDay.getGender()) ? "Green" : "Red");
        feedback.put("collegeGrad", guessedPerson.isCollegeGrad() == personOfTheDay.isCollegeGrad() ? "Green" : "Red");

        // brainRot feedback
        if (guessedPerson.getBrainRot().equals(personOfTheDay.getBrainRot())) {
            feedback.put("brainRot", "Green");
        } else {
            feedback.put("brainRot", "Red:" + guessedPerson.getBrainRot());
        }

        // birthYear feedback
        if (guessedPerson.getBirthYear() == personOfTheDay.getBirthYear()) {
            feedback.put("birthYear", "Green");
        } else if (guessedPerson.getBirthYear() < personOfTheDay.getBirthYear()) {
            feedback.put("birthYear", "Red\u2191");  // "Red↑"
        } else {
            feedback.put("birthYear", "Red\u2193");  // "Red↓"
        }

        // height feedback
        if (guessedPerson.getHeight() == personOfTheDay.getHeight()) {
            feedback.put("height", "Green");
        } else if (guessedPerson.getHeight() < personOfTheDay.getHeight()) {
            feedback.put("height", "Red\u2191");
        } else {
            feedback.put("height", "Red\u2193");
        }

        feedback.put("domainExpansion", guessedPerson.isDomainExpansion() == personOfTheDay.isDomainExpansion() ? "Green" : "Red");

        if (correctGuess) {
            todayResult.setStatus("PASS");
            userData.setGuessesLeft(0);
        } else if (userData.getGuessesLeft() <= 0) {
            todayResult.setStatus("FAIL");
        } else {
            todayResult.setStatus("INCOMPLETE");
        }

        feedback.put("gameStatus", todayResult.getStatus());
        return feedback;
    }

    @GetMapping("/people")
    public List<String> getPeople() {
        return PeopleData.getPeople().stream().map(Person::getName).toList();
    }

    @GetMapping("/correct-person")
    public Person getCorrectPerson() {
        return CastcadleBackendApplication.getPersonOfTheDay();
    }

    @GetMapping("/user-data")
    public UserGameData getUserData(@RequestParam String userId) {
        return UserGameDataRepository.getUserGameData(userId);
    }
}
