import { LightningElement, api } from 'lwc';
import processInsertCSV from '@salesforce/apex/AadharController.processInsertCSV';
import processUpdateCSV from '@salesforce/apex/AadharController.processUpdateCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CsvUploader extends LightningElement {

    @api mode; // 'insert' or 'update'

    fileData = '';        // raw CSV (for Apex)
    previewData = [];     // parsed data (for UI)
    showPreview = false;
    columns = [];

    // FILE UPLOAD (STORE ONLY)
    handleFile(event) {
        const file = event.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            this.fileData = reader.result;
        };

        reader.readAsText(file);
    }

    // PREVIEW BUTTON
    handlePreview() {

        if (!this.fileData) {
            this.showToast('Error', 'Please upload file first', 'error');
            return;
        }

        const lines = this.fileData.split('\n');

        // CLEAN HEADERS
        const headers = lines[0]
            .split(',')
            .map(h => h.replace(/\r/g, '').trim());

        this.previewData = [];

        for (let i = 1; i < lines.length; i++) {

            if (!lines[i] || lines[i].trim() === '') continue;

            // CLEAN VALUES (FIXES LAST COLUMN ISSUE)
            const values = lines[i]
                .split(',')
                .map(v => v.replace(/\r/g, '').trim());

            let obj = {};

            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });

            // ADD ROW NUMBER (FOR UI)
            obj.rowNumber = i;

            this.previewData.push(obj);
        }

        this.setColumns(headers);
        this.showPreview = true;
    }

    // DYNAMIC COLUMNS
    setColumns(headers) {

        let cols = [];

        // Add row number column
        cols.push({
            label: 'Row',
            fieldName: 'rowNumber',
            type: 'number',
            fixedWidth: 70
        });

        headers.forEach(header => {
            cols.push({
                label: header,
                fieldName: header
            });
        });

        this.columns = cols;
    }

    // CLOSE MODAL
    handleClose() {
        this.showPreview = false;
        this.previewData = [];
    }

    // INSERT / UPDATE (OLD LOGIC)
    handleInsert() {

        const action = this.mode === 'update'
            ? processUpdateCSV
            : processInsertCSV;

        action({ csvData: this.fileData })
            .then((jobId) => {

                this.jobId = jobId;
                this.showToast('Success', 'Batch started successfully', 'success');
                this.showPreview = false;
            })
            .catch(err => {
                let message = err?.body?.message || err?.message || 'Unknown error';
                this.showToast('Error', message, 'error');
            });
    }

    // TOAST
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}