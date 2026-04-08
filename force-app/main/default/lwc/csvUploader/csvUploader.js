import { LightningElement, api } from 'lwc';
import processInsertCSV from '@salesforce/apex/AadharController.processInsertCSV';
import processUpdateCSV from '@salesforce/apex/AadharController.processUpdateCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CsvUploader extends NavigationMixin(LightningElement) {

    @api mode; // 'insert' or 'update'

    fileData = '';
    fileName = '';
    previewData = [];
    showPreview = false;
    columns = [];

    // FILE UPLOAD 
    handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.fileName = file.name;
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

        const MAX_PREVIEW_ROWS = 2000;

        const lines = this.fileData.split('\n');
        const headers = lines[0]
            .split(',')
            .map(h => h.replace(/\r/g, '').trim());

        this.previewData = [];

        for (let i = 1; i <= MAX_PREVIEW_ROWS; i++) {
            if (!lines[i] || lines[i].trim() === '') continue;

            const values = lines[i].split(',').map(v => v.trim());
            let obj = {};

            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });

            obj.rowNumber = i;
            this.previewData.push(obj);
        }

        // if (lines.length > MAX_PREVIEW_ROWS) {
        //     this.showToast(
        //         'Info',
        //         `Showing first ${MAX_PREVIEW_ROWS} records only`,
        //         'info'
        //     );
        // }

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

    // INSERT / UPDATE 
    handleInsert() {
        const action = this.mode === 'update'
            ? processUpdateCSV
            : processInsertCSV;


        const payload = {
            fileName: this.fileName,
            fileContent: this.fileData
        };


        action({ csvData: JSON.stringify(payload) })
            .then(jobId => {
                this.jobId = jobId;
                this.showToast('Success', 'Batch started successfully', 'success');
                this.showPreview = false;

                this[NavigationMixin.Navigate]({
                    type: 'standard__navItemPage',
                    attributes: {
                        apiName: 'AadharListView1'
                    }
                });
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