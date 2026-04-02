import { LightningElement, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/AadharController.getRecords';
import deleteRecords from '@salesforce/apex/AadharController.deleteRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import AADHAR_OBJECT from '@salesforce/schema/Aadhar_Entry__c';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
export default class AadharListView extends LightningElement {

    @track data = [];
    @track selectedRows = [];

    @track stateOptions = [];
    @track cityOptions = [];

    allCityValues;

    sState = null;
    sCity = null;

    pageSize = 10;
    offset = 0;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email__c' },
        { label: 'Contact', fieldName: 'Contact_Number__c' },
        { label: 'City', fieldName: 'City__c' },
        { label: 'State', fieldName: 'State__c' }
    ];

    connectedCallback() {
        this.loadData();
    }

    // LOAD DATA WITH FILTER
    loadData() {
        getRecords({
            state: this.sState,
            city: this.sCity,
            limitSize: this.pageSize,
            offsetVal: this.offset
        })
        .then(result => {
            this.data = result;
        })
        .catch(error => {
            this.showToast('Error', error.body.message, 'error');
        });
    }

    // OBJECT INFO
    @wire(getObjectInfo, { objectApiName: AADHAR_OBJECT })
    objectInfo;

    // PICKLIST VALUES
    @wire(getPicklistValuesByRecordType, {
        objectApiName: AADHAR_OBJECT,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    wiredPicklists({ data, error }) {
        if (data) {

            // STATE OPTIONS
            this.stateOptions = data.picklistFieldValues.State__c.values.map(item => ({
                label: item.label,
                value: item.value
            }));

            // STORE CITY METADATA
            this.allCityValues = data.picklistFieldValues.City__c;
        }
    }

    // STATE CHANGE
    handleStateChange(event) {

        this.sState = event.detail.value;
        this.sCity = null; // reset city
        this.offset = 0;

        this.setCities(this.sState);
        this.loadData();
    }

    // CITY FILTERING (DEPENDENT PICKLIST)
    setCities(stateValue) {

        const controllerValues = this.allCityValues.controllerValues;
        const key = controllerValues[stateValue];

        this.cityOptions = this.allCityValues.values
            .filter(city => city.validFor.includes(key))
            .map(city => ({
                label: city.label,
                value: city.value
            }));
    }

    // CITY CHANGE
    handleCityChange(event) {

        this.sCity = event.detail.value;
        this.offset = 0;

        this.loadData();
    }

    resetFilter() {
        this.sState = null;
        this.sCity = null;
        this.offset = 0;
        this.cityOptions = [];
        this.loadData();
    }

    // PAGINATION
    handleNext() {
        this.offset += this.pageSize;
        this.loadData();
    }

    handlePrev() {
        if (this.offset >= this.pageSize) {
            this.offset -= this.pageSize;
            this.loadData();
        }
    }

    // ROW SELECTION
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    // DELETE
    handleDelete() {

        const ids = this.selectedRows.map(row => row.Id);

        deleteRecords({ recordIds: ids })
            .then(() => {
                this.showToast('Success', 'Deleted', 'success');
                this.loadData();
            })
            .catch(err => {
                this.showToast('Error', err.body.message, 'error');
            });
    }

    // EXPORT
    handleExport() {

        let csv = 'Name,Email,Contact,City,State\n';

        this.data.forEach(row => {
            csv += `${row.Name},${row.Email__c},${row.Contact_Number__c},${row.City__c},${row.State__c}\n`;
        });

        const element = document.createElement('a');
        element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        element.download = 'AadharData.xls';
        element.click();
    }

    // TOAST
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}