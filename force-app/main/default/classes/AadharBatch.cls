public class AadharBatch implements Database.Batchable<Aadhar_Entry__c>, Database.Stateful {

    private List<Aadhar_Entry__c> records;
    private Boolean isUpdate;

    public AadharBatch(List<Aadhar_Entry__c> records, Boolean isUpdate) {
        this.records = records;
        this.isUpdate = isUpdate;
    }

    public Iterable<Aadhar_Entry__c> start(Database.BatchableContext bc) {
        return records;
    }

    public void execute(Database.BatchableContext bc, List<Aadhar_Entry__c> scope) {

        system.debug(scope);
        List<Aadhar_Entry__c> validList = new List<Aadhar_Entry__c>();

        for (Aadhar_Entry__c rec : scope) {

            List<String> errors = AadharValidator.validate(rec);

            if (errors.isEmpty()) {
                validList.add(rec);
            }
        }

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
    }
}