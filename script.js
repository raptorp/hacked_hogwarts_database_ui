"use strict";

function start() {
  async function loadData() {
    try {
      const response = await fetch(
        "https://petlatkea.dk/2021/hogwarts/students.json"
      );
      const data = await response.json();
      const cleanedData = cleanData(data);
      createTableRows(cleanedData);
    } catch (error) {
      console.error(error);
    }
  }

  function cleanData(data) {
    return data.map((item) => {
      const fullname = item.fullname.trim();
      const house = item.house.trim().toLowerCase();
      const gender = item.gender.trim().toLowerCase();
      let firstName = "";
      let lastName = "";
      let middleName = "";
      let nickname = fullname.match(/\"(.*?)\"/)?.[1];

      // split the full name into first, middle, and last name
      const nameParts = fullname.split(" ");
      if (nameParts.length === 1) {
        // if there's only one name, it must be the first name
        firstName = nameParts[0];
      } else {
        // if there's more than one name, assume the first name is the first element
        firstName = nameParts.shift();

        // check for nickname (must be in quotes)
        const lastPart = nameParts[nameParts.length - 1];
        if (lastPart.startsWith('"') && lastPart.endsWith('"')) {
          nickname = lastPart.slice(1, -1);
          nameParts.pop();
        }

        // what's left must be the last name and any middle names
        lastName = nameParts.pop();
        middleName = nameParts
          .filter(
            (namePart) => !namePart.startsWith('"') && !namePart.endsWith('"')
          )
          .join(" ");
      }

      // remove "special" characters from the name properties
      const cleanFirstName = firstName
        .replace(/[^a-zA-Z\-]/g, "")
        .toLowerCase();
      const cleanLastName = lastName.replace(/[^a-zA-Z\-]/g, "").toLowerCase();
      const cleanMiddleName = middleName
        .replace(/[^a-zA-Z\-]/g, "")
        .toLowerCase();

      return {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        middleName: cleanMiddleName,
        nickname,
        house: house,
        gender: gender,
      };
    });
  }

  function sortTableRows(headerId, headerIndex, cleanData) {
    const tableBody = document.querySelector("#studentTable tbody");
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aText = a.children[headerIndex].textContent;
      const bText = b.children[headerIndex].textContent;
      return aText.localeCompare(bText);
    });

    const alreadySorted = headerId.startsWith("sorted-");
    if (alreadySorted) {
      rows.reverse();
    }

    const tableHeaders = document.querySelectorAll("#studentTable th");
    tableHeaders.forEach((header) => {
      header.id = header.id.replace(/^sorted-/, "");
    });

    headerId = alreadySorted
      ? headerId.replace(/^sorted-/, "")
      : "sorted-" + headerId;
    console.log(document.querySelector("#studentTable"));
    document.querySelector(`#${headerId}`).id = headerId;

    tableBody.innerHTML = "";
    rows.forEach((row) => tableBody.appendChild(row));
  }

  function createTableRows(cleanData) {
    const tableBody = document.querySelector("#studentTable tbody");
    tableBody.innerHTML = "";

    const rowTemplate = document.querySelector("#table-row-template");

    cleanData.forEach((student) => {
      // clone the table row template
      const row = rowTemplate.content.cloneNode(true);

      // update the cloned row with student data
      row.querySelector(".last-name").textContent = student.lastName;
      row.querySelector(".first-name").textContent = student.firstName;
      row.querySelector(".house").textContent = student.house;
      row.querySelector(".gender").textContent = student.gender;

      // add click event listener to row to display popup
      row.querySelector(".first-name").addEventListener("click", () => {
        showPopup(student);
      });
      row.querySelector(".last-name").addEventListener("click", () => {
        showPopup(student);
      });

      // add row to table body
      tableBody.appendChild(row);

      // log the row to check that the event listener is being added properly
      console.log("Added row", row);
    });

    // add event listeners to table headers for sorting
    const tableHeaders = document.querySelectorAll("#studentTable th");
    tableHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const headerId = header.id;
        const headerIndex = Array.from(tableHeaders).indexOf(header);
        sortTableRows(headerId, headerIndex, cleanData);
      });
    });
  }

  function showPopup(student) {
    // create popup overlay
    const popupOverlay = document.createElement("div");
    popupOverlay.classList.add("popup-overlay");

    // create popup container
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");
    popupOverlay.appendChild(popupContainer);

    // create popup header
    const popupHeader = document.createElement("div");
    popupHeader.classList.add("popup-header");
    popupContainer.appendChild(popupHeader);

    // create popup close button
    const closeButton = document.createElement("button");
    closeButton.classList.add("popup-close-button");
    closeButton.textContent = "x";
    closeButton.addEventListener("click", () => {
      popupOverlay.remove();
    });
    popupHeader.appendChild(closeButton);

    // create popup title
    const popupTitle = document.createElement("h2");
    popupTitle.classList.add("popup-title");
    popupTitle.textContent = "Student Details";
    popupHeader.appendChild(popupTitle);

    // create popup content
    const popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");
    popupContainer.appendChild(popupContent);

    // add student details to popup content
    const name =
      student.firstName + " " + student.middleName + " " + student.lastName;
    const nameParagraph = document.createElement("p");
    nameParagraph.innerHTML = `<strong>Name:</strong> ${name}`;
    popupContent.appendChild(nameParagraph);

    const houseParagraph = document.createElement("p");
    houseParagraph.innerHTML = `<strong>House:</strong> ${student.house}`;
    popupContent.appendChild(houseParagraph);

    const genderParagraph = document.createElement("p");
    genderParagraph.innerHTML = `<strong>Gender:</strong> ${student.gender}`;
    popupContent.appendChild(genderParagraph);

    // add popup to the DOM
    document.body.appendChild(popupOverlay);
  }

  const tableHeaders = document.querySelectorAll("#studentTable th");
  tableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const headerId = header.id;
      const headerIndex = Array.from(tableHeaders).indexOf(header);
      sortTableRows(headerId, headerIndex, cleanData);
    });
  });

  loadData();
}

window.addEventListener("DOMContentLoaded", start);
