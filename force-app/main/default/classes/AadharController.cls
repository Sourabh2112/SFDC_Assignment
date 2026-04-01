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
        List<Aadhar_Entry__c> records = CSVParser.parse(csvData, 'PERSONAL');
        return AadharService.processInsert(records);
    }

    //CSV UPDATE (ID BASED)
    @AuraEnabled
    public static List<String> processUpdateCSV(String csvData) {
        List<Aadhar_Entry__c> records = CSVParser.parse(csvData, 'CONTACT_UPDATE');
        return AadharService.processUpdate(records);
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Aadhar_Entry__c> getRecords(String state, String city, Integer limitSize, Integer offsetVal) {

        String query = 'SELECT Id, Name, First_Name__c, Last_Name__c, Email__c, Contact_Number__c, City__c, State__c, CreatedById ' +
                    'FROM Aadhar_Entry__c WHERE Id != null';

        if(String.isNotBlank(state)) {
            query += ' AND State__c = :state';
        }
        if(String.isNotBlank(city)) {
            query += ' AND City__c = :city';
        }
        query += ' LIMIT :limitSize OFFSET :offsetVal';
        return Database.query(query);
    }

    @AuraEnabled
    public static void deleteRecords(List<Id> recordIds) {

        List<Aadhar_Entry__c> records = [
            SELECT Id, CreatedById
            FROM Aadhar_Entry__c
            WHERE Id IN :recordIds
        ];
        Id currentUserId = UserInfo.getUserId();
        for(Aadhar_Entry__c rec : records) {
            if(rec.CreatedById == currentUserId) {
                throw new AuraHandledException('You cannot delete your own record');
            }
        }
        delete records;
    }
}