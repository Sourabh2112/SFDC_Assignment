public with sharing class CSVParser {

    public static List<Aadhar_Entry__c> parse(String csvData, Boolean isUpdate) {

        List<Aadhar_Entry__c> records = new List<Aadhar_Entry__c>();

        if(String.isBlank(csvData)) return records;

        List<String> lines = csvData.split('\n');

        for(Integer i = 1; i < lines.size(); i++) {

            if(String.isBlank(lines[i])) continue;

            List<String> cols = lines[i].split(',');

            Aadhar_Entry__c rec = new Aadhar_Entry__c();
            Integer index = 0;

            try {

                if(isUpdate) {
                    rec.Id = cols[index++].trim();
                }

                rec.First_Name__c = cols[index++].trim();
                rec.Last_Name__c = cols[index++].trim();

                // DATE SAFE
                String dobStr = cols[index++].trim();
                if(!String.isBlank(dobStr)) {
                    rec.DOB__c = Date.valueOf(dobStr);
                }

                //rec.Contact_Number__c = cols[index++].trim();
                // CONTACT SAFE PARSE
                String contactStr = cols[index++].trim();
                if(!String.isBlank(contactStr)) {
                    rec.Contact_Number__c = Decimal.valueOf(contactStr);
                }
                rec.Email__c = cols[index++].trim();
                rec.City__c = cols[index++].trim();
                rec.State__c = cols[index++].trim();

                // SAFE DECIMAL PARSE (IMPORTANT)
                String pinStr = cols[index++].trim();
                if(!String.isBlank(pinStr)) {
                    rec.Pin__c = Decimal.valueOf(pinStr);
                }

                records.add(rec);

            } catch (Exception e) {
                // Skip bad row (don’t crash whole upload)
                System.debug('CSV Parse Error at row ' + i + ': ' + e.getMessage());
            }
        }

        return records;
    }
}