import { LightningElement, api, track, wire } from 'lwc';
import getRecord from '@salesforce/apex/AadharController.getRecord';
import updateContact from '@salesforce/apex/AadharController.updateContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class FormContact extends LightningElement {

    @api recordId;
    @track record = {};

    // FETCH EXISTING DATA
    @wire(getRecord, { recordId: '$recordId' })
        wiredRecord({ data, error }) {
            if (data) {
                this.record = { ...data };
            } else if (error) {
                console.error(error);
            }
    }

    handleChange(event) {
        this.record[event.target.dataset.field] = event.target.value;
        //console.log('Record Id:', this.recordId);
    }

    handleUpdate() {

        updateContact({
            recordId: this.recordId,
            rec: this.record
        })
            .then(() => {
                this.showToast('Success', 'Updated', 'success');
                this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(err => {
                this.showToast('Error', err.body.message, 'error');
            });
    }

    handleReset() {
        this.record = {};
        console.log('Record Id:', this.recordId);
        const inputs = this.template.querySelectorAll('lightning-input, lightning-radio-group');

        inputs.forEach(input => {
            if (input.type === 'radio') {
                input.value = '';
            } else {
                input.value = null;
            }
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}