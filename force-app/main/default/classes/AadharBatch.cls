public class AadharBatch implements Database.Batchable<Aadhar_Entry__c>, Database.Stateful {

    private List<Aadhar_Entry__c> records;
    private Boolean isUpdate;

    public List<String> errorLogs = new List<String>();

    public AadharBatch(List<Aadhar_Entry__c> records, Boolean isUpdate) {
        this.records = records;
        this.isUpdate = isUpdate;
    }

    public Iterable<Aadhar_Entry__c> start(Database.BatchableContext bc) {
        return records;
    }

    public void execute(Database.BatchableContext bc, List<Aadhar_Entry__c> scope) {

        List<Aadhar_Entry__c> validList = new List<Aadhar_Entry__c>();

        // FETCH EXISTING RECORDS (FOR UPDATE ONLY)
        Map<Id, Aadhar_Entry__c> existingMap = new Map<Id, Aadhar_Entry__c>();

        if (isUpdate) {

            Set<Id> ids = new Set<Id>();

            for (Aadhar_Entry__c rec : scope) {
                if (rec.Id != null) {
                    ids.add(rec.Id);
                }
            }

            if (!ids.isEmpty()) {
                existingMap = new Map<Id, Aadhar_Entry__c>([
                    SELECT Id, First_Name__c, Middle_Name__c, Last_Name__c,
                           DOB__c, Gender__c,
                           Contact_Number__c, Email__c,
                           Address_Line1__c, City__c, State__c, Pin__c
                    FROM Aadhar_Entry__c
                    WHERE Id IN :ids
                ]);
            }
        }

        // PROCESS RECORDS
        for (Aadhar_Entry__c rec : scope) {

            try {

                List<String> errors;

                if (isUpdate) {

                    if (rec.Id == null || !existingMap.containsKey(rec.Id)) {
                        errorLogs.add('Invalid Id: ' + rec.Id);
                        continue;
                    }

                    // MERGE DATA
                    Aadhar_Entry__c existing = existingMap.get(rec.Id);

                    existing.Contact_Number__c = rec.Contact_Number__c;
                    existing.Email__c = rec.Email__c;
                    existing.Address_Line1__c = rec.Address_Line1__c;
                    existing.City__c = rec.City__c;
                    existing.State__c = rec.State__c;
                    existing.Pin__c = rec.Pin__c;

                    // VALIDATE UPDATE
                    errors = AadharValidator.validateUpdate(existing);

                    if (errors.isEmpty()) {
                        validList.add(existing);
                    } else {
                        errorLogs.add('Update Error (Id: ' + rec.Id + '): ' + String.join(errors, ', '));
                    }

                } else {

                    // VALIDATE INSERT
                    errors = AadharValidator.validateInsert(rec);

                    if (errors.isEmpty()) {
                        validList.add(rec);
                    } else {
                        errorLogs.add('Insert Error: ' + String.join(errors, ', '));
                    }
                }

            } catch (Exception e) {
                errorLogs.add('Exception: ' + e.getMessage());
            }
        }

        // BULK DML
        if (!validList.isEmpty()) {

            if (isUpdate) {
                update validList;
            } else {
                insert validList;
            }
        }
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Batch Completed');
        System.debug('Errors: ' + errorLogs);
    }
}