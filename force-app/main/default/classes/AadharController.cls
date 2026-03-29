public with sharing class AadharController {

    //Fetch Aadhar Record by Id
    @AuraEnabled(cacheable=true)
    public static Aadhar_Entry__c getRecord(Id recordId) {

        return [
            SELECT Id,
                Contact_Number__c,
                Email__c,
                Address_Line1__c,
                City__c,
                State__c,
                Pin__c
            FROM Aadhar_Entry__c
            WHERE Id = :recordId
            LIMIT 1
        ];
    }

    // PERSONAL CREATE
    @AuraEnabled
    public static Id createPersonal(Aadhar_Entry__c rec) {
        return AadharService.createPersonal(rec);
    }

    // CONTACT UPDATE
    @AuraEnabled
    public static void updateContact(Id recordId, Aadhar_Entry__c rec) {
        AadharService.updateContact(recordId, rec);
    }

    // CSV INSERT
    @AuraEnabled
    public static List<String> processInsertCSV(String csvData) {
        List<Aadhar_Entry__c> records = CSVParser.parse(csvData, false);
        return AadharService.processInsert(records);
    }

    // CSV UPDATE (ID BASED)
    @AuraEnabled
    public static List<String> processUpdateCSV(String csvData) {
        List<Aadhar_Entry__c> records = CSVParser.parse(csvData, true);
        return AadharService.processUpdate(records);
    }
}