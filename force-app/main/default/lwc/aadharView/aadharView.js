import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import NAME from '@salesforce/schema/Aadhar_Entry__c.Name';
import FIRST_NAME from '@salesforce/schema/Aadhar_Entry__c.First_Name__c';
import LAST_NAME from '@salesforce/schema/Aadhar_Entry__c.Last_Name__c';
import DOB from '@salesforce/schema/Aadhar_Entry__c.DOB__c';
import GENDER from '@salesforce/schema/Aadhar_Entry__c.Gender__c';
import CONTACT from '@salesforce/schema/Aadhar_Entry__c.Contact_Number__c';
import EMAIL from '@salesforce/schema/Aadhar_Entry__c.Email__c';
import CITY from '@salesforce/schema/Aadhar_Entry__c.City__c';
import STATE from '@salesforce/schema/Aadhar_Entry__c.State__c';
import PIN from '@salesforce/schema/Aadhar_Entry__c.Pin__c';

const FIELDS = [
    NAME, FIRST_NAME, LAST_NAME, DOB, GENDER,
    CONTACT, EMAIL, CITY, STATE, PIN
];

export default class AadharView extends LightningElement {

    @api recordId;
    record;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            this.record = data;
        } else if (error) {
            console.error(error);
        }
    }

    //  GETTERS (IMPORTANT)

    get name() {
        return getFieldValue(this.record, NAME);
    }

    get firstName() {
        return getFieldValue(this.record, FIRST_NAME);
    }

    get lastName() {
        return getFieldValue(this.record, LAST_NAME);
    }

    get dob() {
        return getFieldValue(this.record, DOB);
    }

    get gender() {
        return getFieldValue(this.record, GENDER);
    }

    get contact() {
        return getFieldValue(this.record, CONTACT);
    }

    get email() {
        return getFieldValue(this.record, EMAIL);
    }

    get city() {
        return getFieldValue(this.record, CITY);
    }

    get state() {
        return getFieldValue(this.record, STATE);
    }

    get pin() {
        return getFieldValue(this.record, PIN);
    }
}