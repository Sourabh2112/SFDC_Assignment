import { LightningElement, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/AadharController.getRecords';
import deleteRecords from '@salesforce/apex/AadharController.deleteRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import AADHAR_OBJECT from '@salesforce/schema/Aadhar_Entry__c';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';

export default class AadharListView extends NavigationMixin(LightningElement) {

    // DATA
    @track data = [];
    @track selectedRows = [];

    // FILTER
    @track stateOptions = [];
    @track cityOptions = [];
    allCityValues;

    sState = null;
    sCity = null;

    // PAGINATION
    pageSize = 10;
    offset = 0;

    // EDIT MODAL
    showModal = false;
    modalMode = ''; // view / edit
    isViewMode = false;
    isEditMode = false;
    selectedRecordId;

    // TABLE COLUMNS
    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email__c' },
        { label: 'Contact', fieldName: 'Contact_Number__c' },
        { label: 'City', fieldName: 'City__c' },
        { label: 'State', fieldName: 'State__c' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Edit', name: 'edit' }
                ]
            }
        }
    ];

    //  INIT
    connectedCallback() {
        this.loadData();
    }

    // LOAD DATA
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

    // PICKLIST
    @wire(getPicklistValuesByRecordType, {
        objectApiName: AADHAR_OBJECT,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    wiredPicklists({ data }) {
        if (data) {

            // STATE
            this.stateOptions = data.picklistFieldValues.State__c.values.map(item => ({
                label: item.label,
                value: item.value
            }));

            // CITY META
            this.allCityValues = data.picklistFieldValues.City__c;
        }
    }

    // STATE CHANGE
    handleStateChange(event) {
        this.sState = event.detail.value;
        this.sCity = null;
        this.offset = 0;

        this.setCities(this.sState);
        this.loadData();
    }

    // DEPENDENT CITY
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

    // ROW SELECT
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    //  ROW ACTION
    handleRowAction(event) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;

        this.selectedRecordId = row.Id;

        if (actionName === 'view') {
            this.modalMode = 'view';
            this.isViewMode = true;
        }

        if (actionName === 'edit') {
            this.modalMode = 'edit';
            this.isEditMode = true;
        }
        this.showModal = true;
    }

    //  VIEW
    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Aadhar_Entry__c',
                actionName: 'view'
            }
        });
    }

    // OPEN EDIT MODAL
    openEditModal(recordId) {
        this.selectedRecordId = recordId;
        this.showEditModal = true;
    }

    // CLOSE MODAL
    handleCloseModal() {
        this.showModal = false;
        this.isEditMode = false;
        this.isViewMode = false;
        this.loadData(); // refresh table
    }

    // DELETE
    handleDelete() {

        if (!this.selectedRows.length) {
            this.showToast('Error', 'Select at least one record', 'error');
            return;
        }

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

    //  TOAST
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}