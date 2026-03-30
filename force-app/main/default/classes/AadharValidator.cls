public with sharing class AadharValidator {

    public static List<String> validate(Aadhar_Entry__c rec) {

        List<String> errors = new List<String>();

        // FIRST NAME (MANDATORY + FORMAT)
        if(String.isBlank(rec.First_Name__c)) {
            errors.add('First Name is required');
        } else if(!Pattern.matches('^[a-zA-Z]+$', rec.First_Name__c)) {
            errors.add('First Name must contain only alphabets');
        }

        //MIDDLE NAME (OPTIONAL + FORMAT)
        if(!String.isBlank(rec.Middle_Name__c)){
           if(!Pattern.matches('^[a-zA-Z]+$', rec.Middle_Name__c)){
            errors.add('Middle Name must contain only alphabets');
           }
        }

        // LAST NAME (MANDATORY + FORMAT)
        if(String.isBlank(rec.Last_Name__c)) {
            errors.add('Last Name is required');
        } else if(!Pattern.matches('^[a-zA-Z]+$', rec.Last_Name__c)) {
            errors.add('Last Name must contain only alphabets');
        }

        if(rec.DOB__c == null) {
            errors.add('DOB required');
        }
        // CONTACT
        if(rec.Contact_Number__c != null &&
        !Pattern.matches('\\d{10}', rec.Contact_Number__c)) {
            errors.add('Invalid Contact Number');
        }

        // PIN
        if(rec.Pin__c != null &&
        !Pattern.matches('\\d{6}', rec.Pin__c)) {
            errors.add('Invalid Pin');
        }

        // Email
        if(rec.Email__c != null &&
           !Pattern.matches('^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$', rec.Email__c)) {
            errors.add('Invalid Email');
        }

        return errors;
    }
}