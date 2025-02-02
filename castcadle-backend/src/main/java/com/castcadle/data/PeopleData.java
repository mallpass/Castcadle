
package com.castcadle.data;
import com.castcadle.model.Person;


import java.util.ArrayList;
import java.util.List;

public class PeopleData {
    public static List<Person> getPeople() {
        List<Person> people = new ArrayList<>();
        people.add(new Person("Matthew", "Male", false, "Severe", 2000, 5, false, "/images/Matt.jpg"));
        people.add(new Person("Ben", "Male", true, "Skibid", 2000, 6, false, "/images/Ben.jpg"));
        people.add(new Person("Gabe", "Male", false, "None", 1995, 5, true, "/images/Gabe.jpg"));
        people.add(new Person("Jack", "Male", true, "Skibidi", 2000, 6, false, "/images/Jack.jpg"));
        people.add(new Person("Mac", "Male", false, "Moderate", 1995, 7, true, "/images/Mac.jpg"));
        people.add(new Person("Max", "Male", false, "Little", 2001, 6, true, "/images/Max.jpg"));
        people.add(new Person("Scarlet", "Female", true, "None", 2014, 3, true, "/images/Scarlet.jpg"));
        people.add(new Person("Suzuki", "Female", true, "Severe", 2019, 2, false, "/images/Suzuki.jpg"));
        people.add(new Person("Thor", "Male", true, "None", 1872, 1, false, "/images/Thor.jpg"));
        people.add(new Person("Turner", "Female", false, "Moderate", 2000, 4, true, "/images/Turner.jpg"));
        return people;
    }
}

