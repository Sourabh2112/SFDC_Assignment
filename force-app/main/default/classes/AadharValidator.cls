public with sharing class AadharValidator {

    public static List<String> validate(Aadhar_Entry__c rec) {

        List<String> errors = new List<String>();

        if(String.isBlank(rec.First_Name__c)) {
            errors.add('First Name required');
        }

        if(String.isBlank(rec.Last_Name__c)) {
            errors.add('Last Name required');
        }

        if(rec.DOB__c == null) {
            errors.add('DOB required');
        }

        // Contact
        if(rec.Contact_Number__c != null &&
           !Pattern.matches('\\d{10}', String.valueOf(rec.Contact_Number__c))) {
            errors.add('Invalid Contact Number');
        }

        // Email
        if(rec.Email__c != null &&
           !Pattern.matches('^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$', rec.Email__c)) {
            errors.add('Invalid Email');
        }

        // Pin
        if(rec.Pin__c != null &&
           !Pattern.matches('\\d{6}', String.valueOf(rec.Pin__c))) {
            errors.add('Invalid Pin');
        }

        return errors;
    }
}