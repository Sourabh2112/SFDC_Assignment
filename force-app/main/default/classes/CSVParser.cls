public with sharing class CSVParser {

    public static List<Aadhar_Entry__c> parse(String csvData, String mode) {

        List<Aadhar_Entry__c> records = new List<Aadhar_Entry__c>();

        if(String.isBlank(csvData)) return records;

        List<String> lines = csvData.split('\n');

        for(Integer i = 1; i < lines.size(); i++) {

            if(String.isBlank(lines[i])) continue;

            List<String> cols = lines[i].split(',');

            Aadhar_Entry__c rec = new Aadhar_Entry__c();
            Integer index = 0;

            try {

                // PERSONAL INSERT
                if(mode == 'PERSONAL') {

                    rec.First_Name__c = cols[index++].trim();
                    rec.Middle_Name__c = cols[index++].trim();
                    rec.Last_Name__c = cols[index++].trim();

                    String dobStr = cols[index++].trim();
                    if(!String.isBlank(dobStr)) {
                        rec.DOB__c = Date.valueOf(dobStr);
                    }

                    rec.Gender__c = cols[index++].trim();
                }

                // CONTACT INSERT (if needed)
                else if(mode == 'CONTACT_INSERT') {

                    rec.Contact_Number__c = cols[index++].trim();
                    rec.Email__c = cols[index++].trim();
                    rec.Address_Line1__c = cols[index++].trim();
                    rec.City__c = cols[index++].trim();
                    rec.State__c = cols[index++].trim();
                    rec.Pin__c = cols[index++].trim();
                }

                // CONTACT UPDATE (ID BASED)
                else if(mode == 'CONTACT_UPDATE') {

                    rec.Id = cols[index++].trim();

                    rec.Contact_Number__c = cols[index++].trim();
                    rec.Email__c = cols[index++].trim();
                    rec.Address_Line1__c = cols[index++].trim();
                    rec.City__c = cols[index++].trim();
                    rec.State__c = cols[index++].trim();
                    rec.Pin__c = cols[index++].trim();
                }

                records.add(rec);
                System.debug('Parsed Records: ' + records);

            } catch (Exception e) {
                System.debug('CSV Parse Error at row ' + i + ': ' + e.getMessage());
            }
        }

        return records;
    }
}