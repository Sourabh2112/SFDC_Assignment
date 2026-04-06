public with sharing class CSVParser {

    public static List<Aadhar_Entry__c> parse(String csvData, String mode) {

        List<Aadhar_Entry__c> records = new List<Aadhar_Entry__c>();

        if (String.isBlank(csvData)) return records;

        List<String> lines = safeSplitLines(csvData);

        for (Integer i = 1; i < lines.size(); i++) {

            if (String.isBlank(lines[i])) continue;

            List<String> cols = safeSplitColumns(lines[i]);

            Aadhar_Entry__c rec = new Aadhar_Entry__c();
            Integer index = 0;

            try {

                // PERSONAL INSERT
                if (mode == 'PERSONAL') {

                    rec.First_Name__c = getCol(cols, index++);
                    rec.Middle_Name__c = getCol(cols, index++);
                    rec.Last_Name__c = getCol(cols, index++);

                    String dobStr = getCol(cols, index++);
                    if (!String.isBlank(dobStr)) {
                        rec.DOB__c = Date.valueOf(dobStr);
                    }

                    rec.Gender__c = getCol(cols, index++);
                }

                // CONTACT INSERT
                else if (mode == 'CONTACT_INSERT') {

                    rec.Contact_Number__c = getCol(cols, index++);
                    rec.Email__c = getCol(cols, index++);
                    rec.Address_Line1__c = getCol(cols, index++);
                    rec.City__c = getCol(cols, index++);
                    rec.State__c = getCol(cols, index++);
                    rec.Pin__c = getCol(cols, index++);
                }

                // CONTACT UPDATE
                else if (mode == 'CONTACT_UPDATE') {

                    rec.Id = getCol(cols, index++);

                    rec.Contact_Number__c = getCol(cols, index++);
                    rec.Email__c = getCol(cols, index++);
                    rec.Address_Line1__c = getCol(cols, index++);
                    rec.City__c = getCol(cols, index++);
                    rec.State__c = getCol(cols, index++);
                    rec.Pin__c = getCol(cols, index++);
                }

                records.add(rec);

            } catch (Exception e) {
                System.debug('CSV Parse Error at row ' + i + ': ' + e.getMessage());
            }
        }

        return records;
    }

    // SAFE LINE SPLIT (NO REGEX)
    private static List<String> safeSplitLines(String data) {
        List<String> lines = new List<String>();
        String current = '';

        for (Integer i = 0; i < data.length(); i++) {
            String ch = data.substring(i, i+1);

            if (ch == '\n') {
                lines.add(current);
                current = '';
            } else if (ch != '\r') { // ignore CR
                current += ch;
            }
        }

        if (!String.isBlank(current)) {
            lines.add(current);
        }

        return lines;
    }

    // SAFE COLUMN SPLIT (NO REGEX)
    private static List<String> safeSplitColumns(String line) {
        List<String> result = new List<String>();
        String current = '';

        for (Integer i = 0; i < line.length(); i++) {
            String ch = line.substring(i, i+1);

            if (ch == ',') {
                result.add(current);
                current = '';
            } else {
                current += ch;
            }
        }

        result.add(current);
        return result;
    }

    // SAFE COLUMN FETCH (NO INDEX ERROR)
    private static String getCol(List<String> cols, Integer index) {
        return (index < cols.size()) ? cols[index].trim() : null;
    }
}