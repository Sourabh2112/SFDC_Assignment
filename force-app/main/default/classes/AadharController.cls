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

    //CSV Bulk insert
    @AuraEnabled
    public static String processInsertCSV(String csvData) {

        Map<String, Object> payload =
            (Map<String, Object>) JSON.deserializeUntyped(csvData);

        String fileName = (String) payload.get('fileName');
        String fileContent = (String) payload.get('fileContent');

        // Save CSV as ContentVersion
        ContentVersion cv = new ContentVersion(
            Title = fileName,
            PathOnClient = fileName,
            VersionData = Blob.valueOf(fileContent)
        );
        insert cv;

        // Start Batch (INSERT mode)
        Database.executeBatch(
            new AadharCSVBatch(cv.Id, 'PERSONAL'),
            200
        );

        return cv.Id; // return job reference
    }

    //CSV Bulk update
    @AuraEnabled
    public static String processUpdateCSV(String csvData) {

        Map<String, Object> payload =
            (Map<String, Object>) JSON.deserializeUntyped(csvData);

        ContentVersion cv = new ContentVersion(
            Title = (String)payload.get('fileName'),
            PathOnClient = (String)payload.get('fileName'),
            VersionData = Blob.valueOf((String)payload.get('fileContent'))
        );
        insert cv;

        Database.executeBatch(
            new AadharCSVBatch(cv.Id, 'CONTACT_UPDATE'),
            200
        );

        return cv.Id;
    }

    @AuraEnabled(cacheable=true)
    public static List<Aadhar_Entry__c> getRecords(
        String state,
        String city,
        Integer limitSize,
        Id lastRecordId
    ) {
        String query =
            'SELECT Id, Name, First_Name__c, Last_Name__c, Email__c, Contact_Number__c, ' +
            'City__c, State__c, CreatedById ' +
            'FROM Aadhar_Entry__c WHERE Id != null';

        if (String.isNotBlank(state)) {
            query += ' AND State__c = :state';
        }
        if (String.isNotBlank(city)) {
            query += ' AND City__c = :city';
        }

        if (lastRecordId != null) {
            query += ' AND Id > :lastRecordId';
        }

        query += ' ORDER BY Id LIMIT :limitSize';

        return Database.query(query);
    }

    @AuraEnabled
    public static List<Aadhar_Entry__c> getExportData(){
        try {
            string querry = 'Select Id, Name, First_Name__c, Last_Name__c, Email__c, Contact_Number__c, City__c, State__c FROM Aadhar_Entry__c';
            return Database.query(querry);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalCount(String state, String city) {
        String query = 'SELECT COUNT() FROM Aadhar_Entry__c';
        if (state != null) {
            query += ' WHERE State__c = :state';
        }
        if (city != null) {
            query += ' AND City__c = :city';
        }
        return Database.countQuery(query);
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