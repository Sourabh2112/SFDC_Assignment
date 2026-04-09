public class AadharValidator {

    public static List<String> validateInsert(Aadhar_Entry__c rec) {

        List<String> errors = new List<String>();

        if (!isAlpha(rec.First_Name__c)) {
            errors.add('Invalid First Name');
        }
        if (rec.Middle_Name__c != Null) {
            if (!isAlpha(rec.Middle_Name__c)) {
                errors.add('Invalid Middle Name');
            }
        }
        if (!isAlpha(rec.Last_Name__c)) {
            errors.add('Invalid Last Name');
        }
        if (rec.DOB__c != null && rec.DOB__c > Date.today()) {
            errors.add('Future DOB not allowed');
        }

        return errors;
    }

    public static List<String> validateUpdate(Aadhar_Entry__c rec) {

        List<String> errors = new List<String>();

        if (rec.Email__c != null &&
            (!rec.Email__c.contains('@') || !rec.Email__c.contains('.'))) {
            errors.add('Invalid Email');
        }
        if (rec.Contact_Number__c != null &&
            (rec.Contact_Number__c.length() != 10 || !rec.Contact_Number__c.isNumeric())) {
            errors.add('Invalid Contact Number');
        }
        if (rec.Pin__c != null && rec.Pin__c.length() != 6) {
            errors.add('Invalid PIN');
        }
        
        return errors;
    }

    private static Boolean isAlpha(String value) {

        if (String.isBlank(value)) {
            return false;
        }

        for (Integer i = 0; i < value.length(); i++) {
            String ch = value.substring(i, i+1);

            if (!((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'))) {
                return false;
            }
        }

        return true;
    }
}