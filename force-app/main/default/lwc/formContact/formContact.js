import { LightningElement, api, track, wire } from 'lwc';
import getRecord from '@salesforce/apex/AadharController.getRecord';
import updateContact from '@salesforce/apex/AadharController.updateContact';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

// PICKLIST IMPORTS
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import AADHAR_OBJECT from '@salesforce/schema/Aadhar_Entry__c';
export default class FormContact extends LightningElement {

    @api recordId;
    @api mode; // 'view' or 'edit'

    @track record = {};
    @track stateOptions = [];
    @track cityOptions = [];

    allCityValues;
    selectedStateIndex;

    // FETCH EXISTING RECORD
    @wire(getRecord, { recordId: '$recordId' })
    wiredRecord({ data, error }) {
        if (data) {
            this.record = { ...data };

            //  If state already exists → populate cities
            if (this.record.State__c && this.stateOptions.length) {
                this.setCities(this.record.State__c);
            }
        } else if (error) {
            console.error(error);
        }
    }

    // GET OBJECT INFO
    @wire(getObjectInfo, { objectApiName: AADHAR_OBJECT })
    objectInfo;

    // GET PICKLIST VALUES
    @wire(getPicklistValuesByRecordType, {
        objectApiName: AADHAR_OBJECT,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    wiredPicklists({ data, error }) {
        if (data) {
            this.stateOptions = data.picklistFieldValues.State__c.values;
            this.allCityValues = data.picklistFieldValues.City__c;

            // Handle prefill after picklist loads
            if (this.record.State__c) {
                this.setCities(this.record.State__c);
            }
        }
    }

    // HANDLE STATE CHANGE
    handleStateChange(event) {
        const selectedState = event.detail.value;

        this.record.State__c = selectedState;
        this.record.City__c = null; // reset city

        this.setCities(selectedState);
    }

    // FILTER CITY BASED ON STATE
    setCities(stateValue) {
        this.selectedStateIndex = this.stateOptions.findIndex(
            state => state.value === stateValue
        );

        this.cityOptions = this.allCityValues.values.filter(city =>
            city.validFor.includes(this.selectedStateIndex)
        );
    }

    // HANDLE CITY CHANGE
    handleCityChange(event) {
        this.record.City__c = event.detail.value;
    }

    validateField(event) {

        const field = event.target;
        const fieldName = field.dataset.field; 
        const value = field.value;

        let errorMessage = '';

        // PHONE VALIDATION
        if (['Contact_Number__c'].includes(fieldName)) {
            const regex = /^[0-9]{10}$/;

            if (value && !regex.test(value)) {
                errorMessage = 'Enter valid 10-digit number';
            }
        }

        // EMAIL VALIDATION
        if (['Email__c'].includes(fieldName)) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value && !regex.test(value)) {
                errorMessage = 'Invalid email format';
            }
        }

        // PHONE VALIDATION
        if (['Pin__c'].includes(fieldName)) {
            const regex = /^[0-9]{6}$/;

            if (value && !regex.test(value)) {
                errorMessage = 'Enter valid pin number number';
            }
        }

        // SET ERROR
        field.setCustomValidity(errorMessage);
        field.reportValidity();
    }

    // HANDLE OTHER INPUTS
    handleChange(event) {
        this.record[event.target.dataset.field] = event.target.value;
    }

    // UPDATE RECORD
    handleUpdate() {

        updateContact({
            recordId: this.recordId,
            rec: this.record
        })
            .then(() => {

                this.showToast('Success', 'Updated', 'success');
                // CLOSE MODAL
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
    get isViewMode() {
        return this.mode === 'view';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}