(function simpleBudgetApp() {
"use strict";
var selectedRows = [];

var amount = document.querySelector("#amount"),
    description = document.querySelector("#transaction-details"),
    table = document.querySelector(".budget-table"),
    totalCell = document.querySelector("#total");

/**
 * Toggles selection class for budget table rows
 * @param event DOM event object.
 */
function rowSelect(event) {

    let tableRow = event.target.parentNode,
        tRowClassLst = tableRow.classList,
        condition = (tRowClassLst.contains("positive")
                        || tRowClassLst.contains("negative")
                        || tRowClassLst.contains("summed-entry"));

    let selRows = selectedRows.slice();

    if (condition) {
        if (tRowClassLst.contains("row-selected")) {
            tRowClassLst.add("remove-selection");
            for (let i = 0; i < selRows.length; i += 1) {
                if (selRows[i].classList.contains("remove-selection")) {
                    selRows[i].classList.remove("row-selected");
                    selRows[i].classList.remove("remove-selection");
                    selRows.splice(i, 1);
                }
            }
        } else {
            tRowClassLst.add("row-selected");
            selRows.push(tableRow);

            // Display selected row data in amount and descr. input fields
            amount.value = tableRow.firstChild.textContent;
            description.value = tableRow.lastChild.textContent;
        }
        selectedRows = selRows.slice();
    }
}

/**
* Removes selected rows from budget table.
*/
function rowDelete() {

    let rowsToDelete = selectedRows.slice();

    if (rowsToDelete.length > 0) {
        for (let element of rowsToDelete) {
            if (element.classList.contains("summed-entry")) {
                if (element.previousElementSibling
                        .classList.contains("positive")
                    || element.previousElementSibling
                        .classList.contains("negative")) {
                    alert ("Please remove all entries for this row first.");
                    break;
                }
            }
            element.remove(0);

            let idx = selectedRows.indexOf(element);
            selectedRows.splice(idx, 1);
        }
    }
    setTotal();
    clearField(amount, description);
}

/**
 * Adds row to budget table.
 */
function rowAdd() {

    let amountToAdd = amount.value;

    if (amountToAdd == "" || amountToAdd == 0) {
        alert("Please enter positive or negative amount.");
        return;
    }

    let numOfRows = table.rows.length,
        row = table.insertRow(numOfRows - 1), // target 2nd row from the bottom
        amountCell = row.insertCell(0),
        descrCell = row.insertCell(1);

    amountCell.textContent = amountToAdd;
    descrCell.textContent = description.value;

    if (amountToAdd > 0) {
        row.className = "positive";
    } else if (amountToAdd < 0) {
        row.className = "negative";
    }

    if (amountToAdd != 0) {
        amountCell.className = "amount-entry";
    }

    clearField(amount, description);
    setTotal();
}

/**
 * Calculates difference between spent and recieved payments.
 * Writes result to the last row of budget table
 */
function setTotal(){

    let amountCells = document.querySelectorAll(".amount-entry"),
        sum = 0;

    for (let i = 0; i < amountCells.length; i += 1) {
        sum += Number(amountCells[i].textContent);
    }
    totalCell.textContent = sum.toFixed(2);
}

/**
 * Creates "Summed up" row with current date and sum of the existing
 * entries.
 */
function sumUp() {

    var firstAmountEntryRowIndex, lastAmountEntryRowIndex;

    let amountEntries = document.querySelectorAll(".amount-entry");
    if (amountEntries.length == 0) {
        alert("There are no entries to sum.");
        return;
    }

    let summedEntry = document.querySelectorAll(".summed-entry"),
        linkElement = document.createElement("a"),
        totalRow = document.querySelector(".total");

    let currentDate = new Date();

    lastAmountEntryRowIndex = totalRow.rowIndex;
    if (summedEntry.length == 0) { // If summing up for the 1st time.
        firstAmountEntryRowIndex = amountEntries[0].parentNode.rowIndex;
    } else {
        firstAmountEntryRowIndex = summedEntry[summedEntry.length - 1]
                                                                .rowIndex + 1;
    }

    for (let i = firstAmountEntryRowIndex; i < lastAmountEntryRowIndex; i++) {
        let rowToHide = table.rows[i];
        toggleDisplay(rowToHide);
    }

    let numOfRows = table.rows.length,
        row = table.insertRow(numOfRows - 1), // Target 2nd row from the bottom.
        amountCell = row.insertCell(0),
        descrCell = row.insertCell(1);

    let linkId = `${firstAmountEntryRowIndex}-${lastAmountEntryRowIndex}`;

    amountCell.classList.add("total-summed");
    amountCell.parentNode.className = "summed-entry";
    descrCell.appendChild(linkElement).id = "range-" + linkId;

    let summedLink = document.querySelector("#" + "range-" + linkId);

    summedLink.textContent = "Summed up. " + currentDate.toLocaleDateString();
    summedLink.setAttribute("href", "#");
    summedLink.className = "summed-link";

    let summedUpAmount = 0;
    for (let i = firstAmountEntryRowIndex; i < lastAmountEntryRowIndex; i++) {
        summedUpAmount += Number (table.rows[i].firstElementChild.textContent);
    }

    let totalSummed = document.querySelectorAll(".total-summed"),
        lastTotalSummedEl = totalSummed[totalSummed.length - 1];

    lastTotalSummedEl.textContent = summedUpAmount.toFixed(2);
}

/**
 * Toggles .hidden class.
 * @param element DOM element object.
 */
function toggleDisplay(element) {
    // Don't hide the last row
    if (element.classList.contains("total")) { return; }
    else if (!element) { return; }
    element.classList.toggle("hidden");
}

/**
 * @param elements {Object[]} Arbitrary number of DOM element objects
 * Sets arguments' values to an empty string.
 */
function clearField(...elements) {

    for (let el of elements) {
        el.value = "";
    }
}

/**
 * @param event DOM event object.
 * Shows/hides summed rows.
 */
function showSummed(event) {

    var target = event.target;

    if (target.classList.contains("summed-link")) {
        let firstHyphen = target.id.indexOf("-"),
            lastHyphen = target.id.lastIndexOf("-"),
            startIndex = Number(target.id.substring(firstHyphen + 1,
                                                                lastHyphen)),
            stopIndex = Number(target.id.substring(lastHyphen + 1));

        for (let i = startIndex; i < stopIndex; i += 1) {
            if (table.rows[i].classList.contains("summed-entry")) { return; }
            toggleDisplay(table.rows[i]);
        }
    }
}

table.addEventListener("click", rowSelect);
table.addEventListener("click", showSummed); // target .summed-link
document.querySelector("#row-remove").addEventListener("click", rowDelete);
document.querySelector("#amount-add").addEventListener("click", rowAdd);
document.querySelector("#sum-up").addEventListener("click", sumUp);
})();
