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

function sortStudents(students, key, direction) {
  console.log(`Sorting by "${key}" in "${direction}" order`);

  const sortedStudents = [...students];

  const sortFunction =
    direction === "asc"
      ? (a, b) => {
          if (a[key] === b[key]) {
            // if the key is the same, compare the star property
            return a.star === b.star ? 0 : a.star ? -1 : 1;
          } else {
            return a[key] > b[key] ? 1 : -1;
          }
        }
      : (a, b) => {
          if (a[key] === b[key]) {
            // if the key is the same, compare the star property
            return a.star === b.star ? 0 : a.star ? 1 : -1;
          } else {
            return a[key] < b[key] ? 1 : -1;
          }
        };

  sortedStudents.sort(sortFunction);
  return sortedStudents;
}

function _filterStudents(elem, data) {
  let tmp = [...elem.querySelectorAll(".filter")];
  //console.log(tmp);
  let filter = tmp.reduce((collector, elem) => {
    if (elem.checked) collector.push(elem.name);
    return collector;
  }, new Array());

  let search = elem.querySelector("#search-bar").value;

  return data.filter(
    (student) =>
      filter.includes(student.house) &&
      filter.includes(student.gender) &&
      (student.firstName.toLowerCase().includes(search.toLowerCase()) ||
        student.lastName.toLowerCase().includes(search.toLowerCase())) &&
      (student.isPrefect ? filter.includes("isPrefect") : true) &&
      (student.isRacist ? filter.includes("isRacist") : true) &&
      (student.isExpelled ? filter.includes("isExpelled") : true)
  );
}

function filterStudents(event) {
  createTableRows(_filterStudents(event, cleanedData));
  updateStudentCount();
}

function createTable() {
  const tableBody = document.querySelector("#studentTable tbody");
  tableBody.innerHTML = "";

  // add header cell blah
  const headerCells = document.querySelectorAll("#sorting th");
  headerCells.forEach((cell) =>
    cell.addEventListener("click", () => {
      console.log(cell);
      const sortKey = cell.dataset.sort;
      const sortDirection =
        cell.dataset.sortDirection === "asc" ? "desc" : "asc";
      cleanedData = sortStudents(cleanedData, sortKey, sortDirection);
      createTableRows(
        _filterStudents(document.querySelector("#filter-buttons"), cleanedData)
      );
      // display sorted animals
      // update sort direction attribute
      cell.dataset.sortDirection = sortDirection;
    })
  );
}

function createTableRows(data) {
  const tableBody = document.querySelector("#studentTable tbody");
  tableBody.innerHTML = "";
  const rowTemplate = document.querySelector("#table-row-template");

  // add row to table body
  tableBody.replaceChildren(
    ...data.map((student, index) => {
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
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      row.querySelector(".isPrefect").innerHTML = prefectStatus;

      const racistStatus = student.isRacist
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      row.querySelector(".isRacist").innerHTML = racistStatus;

      const expelledStatus = student.isExpelled
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      row.querySelector(".isExpelled").innerHTML = expelledStatus;

      // add appropriate class to row based on student's house
      row.querySelector("tr").classList.add(student.house.toLowerCase());

      // add appropriate class to row based on student's gender
      row.querySelector("tr").classList.add(student.gender.toLowerCase());

      // add appropriate class to row based on student's blood status
      if (student.bloodStatus) {
        row
          .querySelector("tr")
          .classList.add(student.bloodStatus.toLowerCase());
      }

      // add click event listener to row to display popup
      row.querySelector(".first-name").addEventListener("click", () => {
        showPopup(student, row);
      });
      row.querySelector(".last-name").addEventListener("click", () => {
        showPopup(student, row);
      });
      return row;
    })
  );

  updateStudentCount();
}

function showPopup(student, row) {
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
  clone.querySelector(".bloodstatus").textContent = student.bloodStatus;
  const genderIcon =
    student.gender === "girl"
      ? "<i class='fas fa-venus'></i>"
      : "<i class='fas fa-mars'></i>";
  clone.querySelector(".gender").innerHTML = genderIcon;

  // create image filename from student's name
  let imageFilename;

  if (student.lastName.includes("-")) {
    const parts = student.lastName.split("-");
    const lastName = parts[parts.length - 1];
    imageFilename = `img/${lastName}_${student.firstName.charAt(0)}.png`;
  } else if (student.lastName === "Patil") {
    imageFilename = `img/${student.lastName}_${student.firstName}.png`;
  } else {
    imageFilename = `img/${student.lastName}_${student.firstName.charAt(
      0
    )}.png`;
  }

  const imgElement = clone.querySelector(".student-img");

  // Check if the image file exists, and if not, display a default image
  fetch(imageFilename)
    .then((response) => {
      if (!response.ok) {
        imgElement.src = "img/avatar.jpg";
      } else {
        imgElement.src = imageFilename;
      }
    })
    .catch(() => {
      imgElement.src = "img/avatar.jpg";
    });

  // add toggle switch event listener for isPrefect
  const toggleSwitchPrefect = clone.querySelector(".toggle-prefect-status");
  toggleSwitchPrefect.checked = student.isPrefect;
  toggleSwitchPrefect.addEventListener("change", () => {
    student.isPrefect = toggleSwitchPrefect.checked;
    const statusIcon = student.isPrefect
      ? "<i class='fa-solid fa-circle-check'></i>"
      : "<i class='fa-solid fa-circle-xmark'></i>";
    const cellId = `prefect-${cleanedData.indexOf(student)}`;
    document.getElementById(cellId).innerHTML = statusIcon;
  });

  // add toggle switch event listener for isRacist
  const toggleSwitchRacist = clone.querySelector(".toggle-racist-status");
  toggleSwitchRacist.checked = student.isRacist;
  toggleSwitchRacist.addEventListener("change", () => {
    if (student.bloodStatus === "pure-blood") {
      student.isRacist = toggleSwitchRacist.checked;
      const statusIcon = student.isRacist
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      const cellId = `racist-${cleanedData.indexOf(student)}`;
      document.getElementById(cellId).innerHTML = statusIcon;
    } else {
      // Show the racist dialog box if the student is not a pure-blood
      const racistDialog = document.getElementById("racist-dialog");
      racistDialog.style.display = "flex";

      // Add an event listener to the OK button that hides the dialog box when it's clicked
      const okButton = racistDialog.querySelector("button");
      okButton.addEventListener("click", () => {
        racistDialog.style.display = "none";
      });

      // Disable the toggle switch
      toggleSwitchRacist.checked = false;
      student.isRacist = false;

      // Set the disabled attribute and add a CSS class to the toggle switch to make it appear faded
      toggleSwitchRacist.setAttribute("disabled", true);
      toggleSwitchRacist.classList.add("disabled-toggle-switch");
    }
  });

  // add toggle switch event listener for isExpelled
  const toggleSwitchExpelled = clone.querySelector(".toggle-expelled-status");
  toggleSwitchExpelled.checked = student.isExpelled;
  toggleSwitchExpelled.addEventListener("change", () => {
    student.isExpelled = toggleSwitchExpelled.checked;
    const statusIcon = student.isExpelled
      ? "<i class='fa-solid fa-circle-check'></i>"
      : "<i class='fa-solid fa-circle-xmark'></i>";
    const cellId = `expelled-${cleanedData.indexOf(student)}`;
    document.getElementById(cellId).innerHTML = statusIcon;
  });

  // create popup overlay
  const popupOverlay = document.createElement("div");
  popupOverlay.classList.add("popup-overlay");

  // change the cardcover depending on the class of the student
  popupOverlay.classList.add(`popup-${student.house}`);

  // create popup container
  const popupContainer = document.createElement("div");
  popupContainer.classList.add("popup-container");
  popupOverlay.appendChild(popupContainer);

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

  createTable();
  createTableRows(cleanedData);
}
