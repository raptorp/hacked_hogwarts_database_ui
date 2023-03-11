"use strict";

window.addEventListener("DOMContentLoaded", start);

let cleanedData = [];

async function loadData(url) {
  let response = await fetch(url);
  return await response.json();
}

function getBloodStatus(lastName, families) {
  const lowerCaseLastName = lastName.toLowerCase();
  if (families.half.includes(lowerCaseLastName)) {
    return "half-blood";
  } else if (families.pure.includes(lowerCaseLastName)) {
    return "pure-blood";
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

    // house name first letter capitalized

    // check if the student's last name is in the list of families or half-bloods
    const isPureBlood = families.pure.includes(cleanLastName);
    const isHalfBlood = families.half.includes(cleanLastName);

    // calculate the student's blood-status
    const bloodStatus = getBloodStatus(cleanLastName, families);

    return {
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      middleName: middleName,
      nickname,
      house: house,
      gender: gender,
      bloodStatus: bloodStatus,
      isPrefect: false,
      isRacist: false,
      isExpelled: false,
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

  cleanData.forEach((student, index) => {
    console.log(`index: ${index}`);
    console.log(`cleanedData index: ${cleanedData.indexOf(student)}`);

    // clone the table row template
    const row = rowTemplate.cloneNode(true).content;

    // update the cloned row with student data
    row.querySelector(".last-name").textContent = student.lastName
      ? student.lastName
      : "----------";
    row.querySelector(".first-name").textContent = student.firstName;
    row.querySelector(".house").textContent = student.house;

    let isPrefectDom = row.querySelector(".isPrefect"); // give each prefect cell a unique id so it can be reached in the pop-up
    isPrefectDom.textContent = student.isPrefect;
    isPrefectDom.id = `prefect-${index}`;

    let isRacistDom = row.querySelector(".isRacist"); // give each racist cell a unique id so it can be reached in the pop-up
    isRacistDom.textContent = student.isRacist;
    isRacistDom.id = `racist-${index}`;

    let isExpelledDom = row.querySelector(".isExpelled"); // give each expelled cell a unique id so it can be reached in the pop-up
    isExpelledDom.textContent = student.isExpelled;
    isExpelledDom.id = `expelled-${index}`;

    // create gender icon and update the gender text with the icon
    const genderIcon =
      student.gender === "girl"
        ? "<i class='fas fa-venus'></i>"
        : "<i class='fas fa-mars'></i>";
    row.querySelector(".gender").innerHTML = genderIcon;

    // create true/false icons for student status and update the text with the icon
    const prefectStatus = student.isPrefect
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    row.querySelector(".isPrefect").innerHTML = prefectStatus;

    const racistStatus = student.isRacist
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    row.querySelector(".isRacist").innerHTML = racistStatus;

    const expelledStatus = student.isExpelled
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    row.querySelector(".isExpelled").innerHTML = expelledStatus;

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

  // add toggle switch event listener for isPrefect
  const toggleSwitchPrefect = clone.querySelector(".toggle-prefect-status");
  toggleSwitchPrefect.checked = student.isPrefect;
  toggleSwitchPrefect.addEventListener("change", () => {
    student.isPrefect = toggleSwitchPrefect.checked;
    const statusIcon = student.isPrefect
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    const cellId = `prefect-${cleanedData.indexOf(student)}`;
    document.getElementById(cellId).innerHTML = statusIcon;
  });

  // add toggle switch event listener for isRacist
  const toggleSwitchRacist = clone.querySelector(".toggle-racist-status");
  toggleSwitchRacist.checked = student.isRacist;
  toggleSwitchRacist.addEventListener("change", () => {
    student.isRacist = toggleSwitchRacist.checked;
    const statusIcon = student.isRacist
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    const cellId = `racist-${cleanedData.indexOf(student)}`;
    document.getElementById(cellId).innerHTML = statusIcon;
  });

  // add toggle switch event listener for isExpelled
  const toggleSwitchExpelled = clone.querySelector(".toggle-expelled-status");
  toggleSwitchExpelled.checked = student.isExpelled;
  toggleSwitchExpelled.addEventListener("change", () => {
    student.isExpelled = toggleSwitchExpelled.checked;
    const statusIcon = student.isExpelled
      ? "<i class='far fa-circle-check'></i>"
      : "<i class='far fa-circle-xmark'></i>";
    const cellId = `expelled-${cleanedData.indexOf(student)}`;
    document.getElementById(cellId).innerHTML = statusIcon;
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
  families.half = families.half.map((familyName) => familyName.toLowerCase());
  families.pure = families.pure.map((familyName) => familyName.toLowerCase());
  const students = await loadData(
    "https://petlatkea.dk/2021/hogwarts/students.json"
  );

  cleanedData = cleanData(students, families);

  createTableRows(cleanedData);
}
