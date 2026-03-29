import { LightningElement, api } from 'lwc';
import processInsertCSV from '@salesforce/apex/AadharController.processInsertCSV';
import processUpdateCSV from '@salesforce/apex/AadharController.processUpdateCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CsvUploader extends LightningElement {

    @api mode; // insert | update
    fileData;

    get buttonLabel() {
        return this.mode === 'update' ? 'Update' : 'Insert';
    }

    handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            this.fileData = reader.result;
        };

        reader.readAsText(file);
    }

    handleUpload() {

        if (!this.fileData) {
            this.showToast('Error', 'Upload file first', 'error');
            return;
        }

        const action = this.mode === 'update'
            ? processUpdateCSV
            : processInsertCSV;

        action({ csvData: this.fileData })
            .then(() => {
                this.showToast('Success', 'Processed', 'success');
                this.dispatchEvent(new CustomEvent('refresh'));
            })
            .catch(err => {
                this.showToast('Error', err.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}