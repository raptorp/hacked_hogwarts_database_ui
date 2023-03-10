"use strict";

window.addEventListener("DOMContentLoaded", start);

async function loadData(url) {
  let response = await fetch(url);
  return await response.json();
}

function getBloodStatus(lastName, families) {
  const lowerCaseLastName = lastName.toLowerCase();
  if (families.pure.includes(lowerCaseLastName)) {
    return "pure-blood";
  } else if (families.half.includes(lowerCaseLastName)) {
    return "half-blood";
  } else {
    return "muggle-born";
  }
}

function cleanData(students, families) {
  return students.map((item, index) => {
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

    // remove "special" characters from the name properties and convert to lowercase
    const cleanFirstName = firstName.replace(/[^a-zA-Z\-]/g, "").toLowerCase();
    const cleanLastName = lastName.replace(/[^a-zA-Z\-]/g, "").toLowerCase();
    const cleanMiddleName = middleName
      .replace(/[^a-zA-Z\-]/g, "")
      .toLowerCase();

    // capitalize the first letter of each name
    firstName =
      cleanFirstName.charAt(0).toUpperCase() + cleanFirstName.slice(1);
    lastName = cleanLastName.charAt(0).toUpperCase() + cleanLastName.slice(1);
    middleName =
      cleanMiddleName.charAt(0).toUpperCase() + cleanMiddleName.slice(1);

    // house name first letter capitalized

    // check if the student's last name is in the list of families or half-bloods
    const isPureBlood = families.pure.includes(cleanLastName);
    const isHalfBlood = families.half.includes(cleanLastName);

    // calculate the student's blood-status
    const bloodStatus = getBloodStatus(cleanLastName, families);

    return {
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      nickname,
      house: house,
      gender: gender,
      bloodStatus: bloodStatus,
    };
  });
}

function updateStudentCount() {
  const tableBody = document.querySelector("#studentTable tbody");
  const visibleRows = tableBody.querySelectorAll(
    "tr:not([style*='display: none'])"
  );
  const countElement = document.querySelector("#studentCount");
  countElement.textContent = `${visibleRows.length} student${
    visibleRows.length !== 1 ? "s" : ""
  } currently listed`;
}

function createTableRows(cleanData) {
  const tableBody = document.querySelector("#studentTable tbody");
  tableBody.innerHTML = "";

  const filterButtons = document.querySelector("#filter-buttons");
  filterButtons.addEventListener("click", (event) => {
    if (event.target.classList.contains("filter")) {
      const filter = event.target.dataset.filter;
      const rows = tableBody.querySelectorAll("tr");
      rows.forEach((row) => {
        if (filter === "all" || row.classList.contains(filter)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });

      updateStudentCount();
    }
  });

  const rowTemplate = document.querySelector("#table-row-template");

  cleanData.forEach((student) => {
    // clone the table row template
    const row = rowTemplate.cloneNode(true).content;

    // update the cloned row with student data
    row.querySelector(".last-name").textContent = student.lastName
      ? student.lastName
      : "----------";
    row.querySelector(".first-name").textContent = student.firstName;
    row.querySelector(".house").textContent = student.house;

    // create gender icon and update the gender text with the icon
    const genderIcon =
      student.gender === "girl"
        ? "<i class='fas fa-venus'></i>"
        : "<i class='fas fa-mars'></i>";
    row.querySelector(".gender").innerHTML = genderIcon;

    // add appropriate class to row based on student's house
    row.querySelector("tr").classList.add(student.house.toLowerCase());

    // add appropriate class to row based on student's gender
    row.querySelector("tr").classList.add(student.gender.toLowerCase());

    // add click event listener to row to display popup
    row.querySelector(".first-name").addEventListener("click", () => {
      showPopup(student);
    });
    row.querySelector(".last-name").addEventListener("click", () => {
      showPopup(student);
    });

    // add row to table body
    tableBody.appendChild(row);
  });

  updateStudentCount();
}

function showPopup(student) {
  // retrieve popup template
  const template = document.querySelector("#popup-template");

  // clone template content
  const clone = template.content.cloneNode(true);

  // update template with student details
  const name =
    student.firstName +
    " " +
    (student.middleName ? student.middleName + " " : "") +
    (student.nickname ? '"' + student.nickname + '"' + " " : "") +
    student.lastName;

  clone.querySelector(".name").textContent = name;
  clone.querySelector(".house").textContent = student.house;
  const genderIcon =
    student.gender === "girl"
      ? "<i class='fas fa-venus'></i>"
      : "<i class='fas fa-mars'></i>";
  clone.querySelector(".gender").innerHTML = genderIcon;

  clone.querySelector(".bloodstatus").textContent = student.bloodStatus;

  // create image filename from student's name
  const imageFilename = `img/${student.lastName}_${student.firstName.charAt(
    0
  )}.png`;
  clone.querySelector(".student-img").src = imageFilename;

  // add toggle switch event listener
  const toggleSwitch = clone.querySelector(".toggle-checkbox");
  toggleSwitch.addEventListener("change", () => {
    const isPrefect = toggleSwitch.checked;
    student.isPrefect = isPrefect;

    // update student data in localStorage or sessionStorage
    if (localStorage.getItem("cleanedData")) {
      localStorage.setItem("cleanedData", JSON.stringify(cleanedData));
    } else if (sessionStorage.getItem("cleanedData")) {
      sessionStorage.setItem("cleanedData", JSON.stringify(cleanedData));
    }

    // add/remove class to student card based on prefect status
    const studentCard = document.querySelector(`#student-${student.id}`);
    if (isPrefect) {
      studentCard.classList.add("prefect");
    } else {
      studentCard.classList.remove("prefect");
    }
  });

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

  // append cloned template to popup content
  const popupContent = document.createElement("div");
  popupContent.classList.add("popup-content");
  popupContent.appendChild(clone);
  popupContainer.appendChild(popupContent);

  // add popup to the DOM
  document.body.appendChild(popupOverlay);
}

async function start() {
  const families = await loadData(
    "https://petlatkea.dk/2021/hogwarts/families.json"
  );
  const students = await loadData(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );

  let cleanedData = [];
  if (localStorage.getItem("cleanedData")) {
    cleanedData = JSON.parse(localStorage.getItem("cleanedData"));
  } else if (sessionStorage.getItem("cleanedData")) {
    cleanedData = JSON.parse(sessionStorage.getItem("cleanedData"));
  } else {
    cleanedData = cleanData(students, families);
  }

  createTableRows(cleanedData);
}
