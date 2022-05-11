"use strict";

/** @type HTMLElement */
const userListEl = document.getElementById("user-list");

/** @type HTMLTemplateElement */
const userRowTemplate = document.getElementById("user-row");

/** @type HTMLTemplateElement */
const addAdminButton = document.querySelector('#add-admin-button');

/** @type HTMLTemplateElement */
const adminFormTemplate = document.querySelector('#new-admin');


// Some JSDoc Record Types:
/**
 * @typedef {
 *     {
 *     "$date": {
 *     "$numberLong": string
 *     } 
 * }} MongoDate
 * @typedef {{
 *      _id: string,
 *      name: string,
 *      emailAddress: string,
 *      avatarURL: string,
 *      dateJoined: MongoDate,
 *      achievements: Array<string>,
 *      admin: boolean
 *      }} UserDoc
 */

/**
 * Creates a <li> element representing an input UserDoc record.
 * @param {UserDoc} userDoc 
 * @returns {HTMLLIElement}
 */

function makeUserRow(userDoc) {
    /** @type HTMLLIElement */
    // Deep copy the contents of the template:
    const row = userRowTemplate.content.cloneNode(true).firstElementChild;
    row.querySelector(".admin-name").value = userDoc.name;
    row.setAttribute('data-user-id', userDoc._id);
    // Fill in other stuff, too?
    // TODO: Profile pictures!

    /** @type = HTMLButtonElement */
    const deleteButton = row.getElementsByClassName('delete-button').item(0);
    deleteButton.addEventListener("click", deleteAction(userDoc._id));

    /** @type = HTMLButtonElement */
    const editButton = row.getElementsByClassName('edit-button').item(0);
    editButton.addEventListener("click", editAction(userDoc._id));

    return row;
}

/**
 * Function that makes a "delete this userID" function
 * for use in click handlers.
 * @param {string} userID - a user ID to delete
 * @returns an async function that performs the delete operation for the given userID
 */
function deleteAction(userID) {
    return async function () {
        let data = {
            '_id': userID
        };
        await fetch('/delete-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        // UI confirmation code etc... goes here
    }
}

// Click on edit button to enable the editing on admin name input
// Pencil icon changes to checkmark icon
// TODO: responses and UI confirmations
function editAction(userID) {
    return async function() {
        /** @type = HTMLButtonElement */
        const userListItem = document.querySelector(`[data-user-id="${userID}"]`);
        const userInput = userListItem.querySelector('.admin-name');
        const editButton = userListItem.querySelector('.edit-button');

        // Check if input is disabled...
        if (userInput.disabled) {
            userInput.disabled = false;
            userInput.focus();
            editButton.innerHTML = `<span class="material-icons teal">done</span>`;
        } else {
            userInput.disabled = true;
            editButton.innerHTML = `<span class="material-icons teal">edit</span>`;
            let data = {
                '_id': userID,
                'name': userInput.value
            };
            await fetch('/edit-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
    }
}

// TODO: add "add admin" functionality
// Load form for admin to fill out, create a new admin in db
function makeAdminForm() {
    // Clone the contents of the add-admin-form template
    const form = adminFormTemplate.content.cloneNode(true).firstElementChild;
    const cancelButton = form.querySelector('#admin-form-cancel-button');
    const submitButton = form.querySelector('#admin-form-submit-button');

    // Create the overlay to darken the contents of the screen
    const overlay = document.createElement('div');
    overlay.setAttribute('class', 'overlay');

    // Make the buttons do things
    submitButton.addEventListener('click', submitAdminForm);
    cancelButton.addEventListener('click', function closeForm() {
        form.remove();
        overlay.remove();
    });

    document.body.appendChild(form);
    document.body.insertBefore(overlay, form);
}

// Should send the contents of the form to server
// TODO: connect to /create-admin
// TODO: make image uploadable
// 
function submitAdminForm() {
    console.log("submit button clicks");
    
}
addAdminButton.addEventListener('click', makeAdminForm);



// TODO: Pagination?
/**
 * Replace the children of the input user list with a fresh batch of <li> elements 
 * generated from the result of the input fetch() Promise.
 * @param {Promise<Response>} toFetch - Promise, usually from fetch(…).
 * @returns {Number} - how many records were inserted into the list.
 */
async function refreshUsers(toFetch) {
    // TODO: Error handling!
    /** @type {Array<UserDoc>} */
    const results = (await (await toFetch).json()).result;

    console.dir(
        results.map(makeUserRow).map(el => el.toString())
    )

    userListEl.replaceChildren(
        ...results.map(makeUserRow)
    )

    return results.length;
}

refreshUsers(fetch('profiles'));