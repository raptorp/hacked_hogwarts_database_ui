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
