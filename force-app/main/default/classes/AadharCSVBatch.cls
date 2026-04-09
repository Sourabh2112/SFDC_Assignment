public class AadharCSVBatch implements Database.Batchable<String>, Database.Stateful {

    private Id contentVersionId;
    private String mode;

    public List<String> errorLogs = new List<String>();

    public AadharCSVBatch(Id cvId, String mode) {
        this.contentVersionId = cvId;
        this.mode = mode;
    }

    public Iterable<String> start(Database.BatchableContext bc) {

        ContentVersion cv = [
            SELECT VersionData
            FROM ContentVersion
            WHERE Id = :contentVersionId
            LIMIT 1
        ];

        // Convert Blob → String
        //String csvText = cv.VersionData.toString();

        // Split lines safely
        //List<String> lines = csvText.split('\n');

        return new CSVLineIterable(cv.VersionData);
    }

    public void execute(Database.BatchableContext bc, List<String> scope) {

        List<Aadhar_Entry__c> validRecords = new List<Aadhar_Entry__c>();

        for (Integer i = 0; i < scope.size(); i++) {

            String line = scope[i];

            // Skip header or empty lines
            if (String.isBlank(line) || line.toLowerCase().contains('first_name__c')) {
                continue;
            }

            try {
                Aadhar_Entry__c rec =
                    CSVParser.parseRow(line, mode);

                List<String> errors =
                    (mode == 'CONTACT_UPDATE')
                        ? AadharValidator.validateUpdate(rec)
                        : AadharValidator.validateInsert(rec);

                if (errors.isEmpty()) {
                    validRecords.add(rec);
                } else {
                    errorLogs.add(
                        'Row error: ' + String.join(errors, ', ')
                    );
                }

            } catch (Exception e) {
                errorLogs.add('Exception: ' + e.getMessage());
            }
        }

        if (!validRecords.isEmpty()) {
            if (mode == 'CONTACT_UPDATE') {
                update validRecords;
            } else {
                insert validRecords;
            }
        }
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Aadhar CSV Batch completed');
        System.debug('Errors: ' + errorLogs);
    }
}