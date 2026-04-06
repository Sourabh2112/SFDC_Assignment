import { LightningElement, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/AadharController.getRecords';
import getExportData from '@salesforce/apex/AadharController.getExportData';
import deleteRecords from '@salesforce/apex/AadharController.deleteRecords';
import getTotalCount from '@salesforce/apex/AadharController.getTotalCount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import AADHAR_OBJECT from '@salesforce/schema/Aadhar_Entry__c';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';

export default class AadharListView extends NavigationMixin(LightningElement) {

    // DATA
    @track data = [];
    @track exporData = [];
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
    totalRecords = 0;
    currentPage = 1;
    totalPages = 1;
    disabledPrev = true;
    disabledNext = false;

    // EDIT MODAL
    showModal = false;
    showCSV = false;
    modalMode = '';
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
        this.loadAllData();
        this.loadCount();
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

    loadAllData() {
        getExportData()
            .then(result => {
                this.exporData = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    loadCount() {
        getTotalCount({
            state: this.sState,
            city: this.sCity
        })
            .then(result => {
                this.totalRecords = result;
                this.totalPages = Math.ceil(result / this.pageSize);
            });
    }

    get pages() {
        let pages = [];
        let startPage, endPage;

        // Total buttons to show
        const maxVisible = 3;

        // Calculate window
        if (this.totalPages <= maxVisible) {
            startPage = 1;
            endPage = this.totalPages;
        } else if (this.currentPage <= 2) {
            startPage = 1;
            endPage = 3;
        } else if (this.currentPage >= this.totalPages - 1) {
            startPage = this.totalPages - 2;
            endPage = this.totalPages;
        } else {
            startPage = this.currentPage - 1;
            endPage = this.currentPage + 1;
        }

        // Create page buttons
        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                label: i,
                value: i,
                variant: i === this.currentPage ? 'brand' : 'neutral'
            });
        }

        return pages;
    }

    handlePageClick(event) {
        const page = Number(event.target.dataset.page);

        this.currentPage = page;
        this.offset = (page - 1) * this.pageSize;

        this.loadData();
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
        this.totalRecords = 0;
        this.currentPage = 1;
        this.totalPages = 1;

        this.setCities(this.sState);
        this.loadData();
        this.loadCount();
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
        this.totalRecords = 0;
        this.currentPage = 1;
        this.totalPages = 1;

        this.loadData();
        this.loadCount();
    }

    // PAGINATION
    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.offset += this.pageSize;
            this.loadData();
            this.disabledNext = false;
            this.disabledPrev = false;
        }
        if (this.currentPage === this.totalPages) {
            this.disabledNext = true;
        }
    }

    handlePrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.offset -= this.pageSize;
            this.loadData();
            this.disabledPrev = false;
            this.disabledNext = false;
        }
        if (this.currentPage === 1) {
            this.disabledPrev = true;
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
        this.showCSV = false;
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
        // HEADER
        let csv = 'Id, Name, First_Name, Last_Name, Email, Contact_Number, City, State\n';

        // ROW DATA
        this.exporData.forEach(row => {

            let line = [
                row.Id || '',
                row.Name || '',
                row.First_Name__c || '',
                row.Last_Name__c || '',
                row.Email__c || '',
                row.Contact_Number__c || '',
                row.City__c || '',
                row.State__c || '',
            ].join(',');

            csv += line + '\n';
        });

        // CREATE FILE
        const element = document.createElement('a');
        element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        element.download = 'AadharData.csv'; // use .csv not .xls

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    handleImport() {
        this.showCSV = true;
    }

    resetFilter() {
        this.sState = null;
        this.sCity = null;
        this.offset = 0;
        this.totalRecords = 0;
        this.currentPage = 1;
        this.totalPages = 1;

        this.loadData();
        this.loadCount();
    }

    //  TOAST
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}