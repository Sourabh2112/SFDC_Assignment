import { LightningElement, track } from 'lwc';
import createPersonal from '@salesforce/apex/AadharController.createPersonal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class FormPersonal extends NavigationMixin(LightningElement) {

    @track record = {};

    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];

    handleChange(event) {
        this.record[event.target.dataset.field] = event.target.value;
    }

    handleSave() {

        if (!this.record.First_Name__c || !this.record.Last_Name__c) {
            this.showToast('Error', 'Mandatory fields missing', 'error');
            return;
        }

        createPersonal({ rec: this.record })
            .then((recordId) => {   // CAPTURE ID

                this.showToast('Success', 'Saved', 'success');

                // REDIRECT
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: recordId,   // NOW VALID
                        objectApiName: 'Aadhar_Entry__c',
                        actionName: 'view'
                    }
                });

            })
            .catch(err => {

                let message = 'Unknown error';

                if (err?.body?.message) {
                    message = err.body.message;
                } else if (err?.message) {
                    message = err.message;
                }

                this.showToast('Error', message, 'error');
            });
    }

    handleReset() {
        this.record = {};
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