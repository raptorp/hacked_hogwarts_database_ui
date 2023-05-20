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
      isInquisitor: false,
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
      (student.isInquisitor ? filter.includes("isInquisitor") : true) &&
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

  // add eventlisteners to header cells
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
      isPrefectDom.id = `prefect-${student.lastName}-${student.firstName}`;

      let isInquisitorDom = row.querySelector(".isInquisitor"); // give each inquisitor cell a unique id so it can be reached in the pop-up
      isInquisitorDom.textContent = student.isInquisitor;
      isInquisitorDom.id = `inquisitor-${student.lastName}-${student.firstName}`;

      let isExpelledDom = row.querySelector(".isExpelled"); // give each expelled cell a unique id so it can be reached in the pop-up
      isExpelledDom.textContent = student.isExpelled;
      isExpelledDom.id = `expelled-${student.lastName}-${student.firstName}`;

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

      const inquisitorStatus = student.isInquisitor
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      row.querySelector(".isInquisitor").innerHTML = inquisitorStatus;

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

const prefectsPerHouse = {
  gryffindor: 0,
  hufflepuff: 0,
  ravenclaw: 0,
  slytherin: 0,
};

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
    if (toggleSwitchPrefect.checked) {
      // Check if the limit of 2 prefects per house has been reached
      if (prefectsPerHouse[student.house] >= 2) {
        // Show the prefect limit dialog box
        const prefectLimitDialog = document.getElementById("prefect-dialog");
        prefectLimitDialog.style.display = "flex";

        // Add an event listener to the OK button that hides the dialog box when it's clicked
        const okButton = prefectLimitDialog.querySelector("button");
        okButton.addEventListener("click", () => {
          prefectLimitDialog.style.display = "none";
        });

        // Set the toggle switch back to unchecked and update the student object
        toggleSwitchPrefect.checked = false;
        student.isPrefect = false;
        return;
      }

      // Increment the number of prefects in the student's house
      prefectsPerHouse[student.house]++;

      // Update the prefect status icon in the table
      const statusIcon = "<i class='fa-solid fa-circle-check'></i>";
      const cellIdPrefect = `prefect-${student.lastName}-${student.firstName}`;
      document.getElementById(cellIdPrefect).innerHTML = statusIcon;
    } else {
      // Decrement the number of prefects in the student's house
      prefectsPerHouse[student.house]--;

      // Update the prefect status icon in the table
      const statusIcon = "<i class='fa-solid fa-circle-xmark'></i>";
      const cellIdPrefect = `prefect-${student.lastName}-${student.firstName}`;
      document.getElementById(cellIdPrefect).innerHTML = statusIcon;
    }

    // Update the student object
    student.isPrefect = toggleSwitchPrefect.checked;
  });

  // add toggle switch event listener for isInquisitor
  const toggleSwitchInquisitor = clone.querySelector(
    ".toggle-inquisitor-status"
  );
  toggleSwitchInquisitor.checked = student.isInquisitor;
  toggleSwitchInquisitor.addEventListener("change", () => {
    if (student.bloodStatus === "pure-blood") {
      student.isInquisitor = toggleSwitchInquisitor.checked;
      const statusIcon = student.isInquisitor
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      const cellIdInquisitor = `inquisitor-${student.lastName}-${student.firstName}`;
      document.getElementById(cellIdInquisitor).innerHTML = statusIcon;
    } else {
      // Show the inquisitor dialog box if the student is not a pure-blood
      const inquisitorDialog = document.getElementById("inquisitor-dialog");
      inquisitorDialog.style.display = "flex";

      // Add an event listener to the OK button that hides the dialog box when it's clicked
      const okButton = inquisitorDialog.querySelector("button");
      okButton.addEventListener("click", () => {
        inquisitorDialog.style.display = "none";
      });

      // Set the toggle switch back to unchecked and update the student object
      toggleSwitchInquisitor.checked = false;
      student.isInquisitor = false;
    }
  });

  // add toggle switch event listener for isExpelled
  const toggleSwitchExpelled = clone.querySelector(".toggle-expelled-status");
  toggleSwitchExpelled.checked = student.isExpelled;
  toggleSwitchExpelled.addEventListener("change", () => {
    if (student.firstName === "Sabrina") {
      // Show an error message and revert the toggle switch back to its original state
      alert("Snape says no.");
      toggleSwitchExpelled.checked = student.isExpelled;
    } else if (!student.isExpelled || toggleSwitchExpelled.checked) {
      // Update the student's expelled status and update the UI accordingly
      student.isExpelled = toggleSwitchExpelled.checked;
      const statusIcon = student.isExpelled
        ? "<i class='fa-solid fa-circle-check'></i>"
        : "<i class='fa-solid fa-circle-xmark'></i>";
      const cellIdExpelled = `expelled-${student.lastName}-${student.firstName}`;
      document.getElementById(cellIdExpelled).innerHTML = statusIcon;
    } else {
      // Show the expelled dialog box if the student is already expelled
      const expelledDialog = document.getElementById("expelled-dialog");
      expelledDialog.style.display = "flex";

      // Add an event listener to the OK button that hides the dialog box when it's clicked
      const okButton = expelledDialog.querySelector("button");
      okButton.addEventListener("click", () => {
        expelledDialog.style.display = "none";
      });

      // Set the toggle switch back to checked and update the student object
      toggleSwitchExpelled.checked = true;
      student.isExpelled = true;
    }
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

function hackTheSystem() {
  // Reset filter buttons to hide the new student better
  const filterCheckboxes = document.querySelectorAll(".filter");
  filterCheckboxes.forEach((checkbox) => (checkbox.checked = true));

  // Create a map to store the original blood status of each student
  const originalBloodStatuses = new Map();
  cleanedData.forEach((student) => {
    originalBloodStatuses.set(student, student.bloodStatus);
  });

  // Randomize the blood status for former pure-bloods
  const formerPureBloods = cleanedData.filter((student) => {
    return originalBloodStatuses.get(student) === "pure-blood";
  });
  const bloodStatuses = ["half-blood", "mud-blood"];
  formerPureBloods.forEach((student) => {
    const randomIndex = Math.floor(Math.random() * bloodStatuses.length);
    const randomBloodStatus = bloodStatuses[randomIndex];
    student.bloodStatus = randomBloodStatus;
  });

  // Set the blood status for half- and muggle-bloods to "pure-blood"
  const halfAndMuggleBloods = cleanedData.filter((student) => {
    return originalBloodStatuses.get(student) !== "pure-blood";
  });
  halfAndMuggleBloods.forEach((student) => {
    student.bloodStatus = "pure-blood";
  });

  // Create a new student object with default values
  const newStudent = {
    firstName: "Sabrina",
    middleName: "",
    nickname: "The Menace",
    lastName: "Sorensen",
    gender: "girl",
    house: "slytherin",
    bloodStatus: "mud-blood",
    isPrefect: false,
    isInquisitor: false,
    isExpelled: false,
  };

  // Toggle off isInquisitor switch for all students
  cleanedData.forEach((student) => {
    student.isInquisitor = false;
    const cellIdInquisitor = `inquisitor-${student.lastName}-${student.firstName}`;
    document.getElementById(cellIdInquisitor).innerHTML =
      "<i class='fa-solid fa-circle-xmark'></i>";
  });

  // Add the new student to the data set
  cleanedData.push(newStudent);
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

  const hackButton = document.querySelector("#hack-button");
  hackButton.addEventListener("click", hackTheSystem);
}
