public with sharing class AadharService {

    // CREATE PERSONAL
    public static Id createPersonal(Aadhar_Entry__c rec) {

        List<String> errors = AadharValidator.validate(rec);

        if(!errors.isEmpty()) {
            throw new AuraHandledException(String.join(errors, ', '));
        }

        insert rec;
        return rec.Id;
    }

    // Update record
    public static void updateContact(Id recordId, Aadhar_Entry__c rec) {

        if(recordId == null) {
            throw new AuraHandledException('Record Id required');
        }

        // Fetch existing record
        Aadhar_Entry__c existing = [
            SELECT Id, First_Name__c, Middle_Name__c, Last_Name__c, DOB__c
            FROM Aadhar_Entry__c
            WHERE Id = :recordId
            LIMIT 1
        ];

        // DUPLICATE CHECK (EMAIL + CONTACT)
        List<Aadhar_Entry__c> duplicates = [
            SELECT Id, Email__c, Contact_Number__c
            FROM Aadhar_Entry__c
            WHERE Id != :recordId
            AND (
                Email__c = :rec.Email__c
                or Contact_Number__c = :rec.Contact_Number__c
            )
            LIMIT 1
        ];

        if(!duplicates.isEmpty()) {
            Aadhar_Entry__c dup = duplicates[0];

            if(dup.Email__c == rec.Email__c) {
                throw new AuraHandledException('Email already exists');
            }

            if(dup.Contact_Number__c == rec.Contact_Number__c) {
                throw new AuraHandledException('Contact number already exists');
            }
        }

        //  Merge contact fields
        existing.Contact_Number__c = rec.Contact_Number__c;
        existing.Email__c = rec.Email__c;
        existing.Address_Line1__c = rec.Address_Line1__c;
        existing.City__c = rec.City__c;
        existing.State__c = rec.State__c;
        existing.Pin__c = rec.Pin__c;

        // Validate full record
        List<String> errors = AadharValidator.validate(existing);

        if(!errors.isEmpty()) {
            throw new AuraHandledException(String.join(errors, ', '));
        }

        update existing;
    }

    // BULK INSERT
    public static List<String> processInsert(List<Aadhar_Entry__c> records) {

        List<Aadhar_Entry__c> validList = new List<Aadhar_Entry__c>();
        List<String> errors = new List<String>();

        for(Aadhar_Entry__c rec : records) {

            List<String> recErrors = AadharValidator.validate(rec);

            if(!recErrors.isEmpty()) {
                errors.add('Insert Error: ' + String.join(recErrors, ', '));
                continue;
            }

            validList.add(rec);
        }

        if(!validList.isEmpty()) {
            insert validList;
        }

        return errors;
    }

    // BULK UPDATE (ID BASED)
    public static List<String> processUpdate(List<Aadhar_Entry__c> records) {

        List<Aadhar_Entry__c> validList = new List<Aadhar_Entry__c>();
        List<String> errors = new List<String>();

        Set<Id> ids = new Set<Id>();

        for(Aadhar_Entry__c rec : records) {
            if(rec.Id == null) {
                errors.add('Missing Id for update');
            } else {
                ids.add(rec.Id);
            }
        }

        Map<Id, Aadhar_Entry__c> existingMap = new Map<Id, Aadhar_Entry__c>(
            [SELECT Id FROM Aadhar_Entry__c WHERE Id IN :ids]
        );

        for(Aadhar_Entry__c rec : records) {

            if(rec.Id == null || !existingMap.containsKey(rec.Id)) {
                errors.add('Invalid Id: ' + rec.Id);
                continue;
            }

            List<String> recErrors = AadharValidator.validate(rec);

            if(!recErrors.isEmpty()) {
                errors.add('Update Error: ' + String.join(recErrors, ', '));
                continue;
            }

            validList.add(rec);
        }

        if(!validList.isEmpty()) {
            update validList;
        }

        return errors;
    }
}