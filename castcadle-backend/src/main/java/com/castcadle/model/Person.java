package com.castcadle.model;


public class Person {
    private String name;
    private String gender;
    private boolean collegeGrad;
    private String brainRot;
    private int birthYear;
    private int height;
    private boolean domainExpansion;
    private String imageUrl;

    public Person(String name, String gender, boolean collegeGrad, String brainRot, int birthYear, int height, boolean domainExpansion, String imageUrl) {
        this.name = name;
        this.gender = gender;
        this.collegeGrad = collegeGrad;
        this.brainRot = brainRot;
        this.birthYear = birthYear;
        this.height = height;
        this.domainExpansion = domainExpansion;
        this.imageUrl = imageUrl;
    }

    // Getters and setters
    public String getName() { return name; }
    public String getGender() { return gender; }
    public boolean isCollegeGrad() { return collegeGrad; }
    public String getBrainRot() { return brainRot; }
    public int getBirthYear() { return birthYear; }
    public int getHeight() { return height; }
    public boolean isDomainExpansion() { return domainExpansion; }
    public String getImageUrl() { return imageUrl; }
}
