package com.castcadle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.castcadle.model.Person;
import com.castcadle.data.PeopleData;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

@SpringBootApplication
public class CastcadleBackendApplication {

    // Static variable holding the shuffled list of people.
    private static List<Person> shuffledPeople;

    // A fixed reference date to use for cycling through the list (adjust as desired)
    private static final LocalDate REFERENCE_DATE = LocalDate.of(2020, 1, 1);

    public static void main(String[] args) {
        SpringApplication.run(CastcadleBackendApplication.class, args);

        // Get the list of people and shuffle it once
        List<Person> people = PeopleData.getPeople();
        Collections.shuffle(people);
        shuffledPeople = people;

        // (Optional) Print out the shuffled order
        System.out.println("Shuffled order of people:");
        for (Person p : shuffledPeople) {
            System.out.println(p.getName());
        }

        // Print the person of the day based on the current date
        System.out.println("Person of the day: " + getPersonOfTheDay().getName());
    }

    public static Person getPersonOfTheDay() {
        LocalDate today = LocalDate.now();
        // Compute the number of days between the reference date and today
        long daysSinceReference = ChronoUnit.DAYS.between(REFERENCE_DATE, today);
        // Use modulo to cycle through the shuffled list
        int index = (int) (daysSinceReference % shuffledPeople.size());
        return shuffledPeople.get(index);
    }
}
