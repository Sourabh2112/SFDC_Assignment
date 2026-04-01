import { LightningElement, track } from 'lwc';
import getRecords from '@salesforce/apex/AadharController.getRecords';
import deleteRecords from '@salesforce/apex/AadharController.deleteRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AadharListView extends LightningElement {

    @track data = [];
    @track selectedRows = [];

    selectedState = '';
    selectedCity = '';

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

    // LOAD DATA
    loadData() {
        getRecords({
            state: this.selectedState,
            city: this.selectedCity,
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

    //FILTER
    handleStateChange(e) {
        this.selectedState = e.detail.value;
    }

    handleCityChange(e) {
        this.selectedCity = e.detail.value;
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

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}