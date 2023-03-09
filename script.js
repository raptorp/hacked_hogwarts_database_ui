document.addEventListener("DOMContentLoaded", () => {
  const tableHeaders = document.querySelectorAll("#studentTable th");

  function sortTableRows(headerId, headerIndex) {
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

  tableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const headerId = header.id;
      const headerIndex = Array.from(tableHeaders).indexOf(header);
      sortTableRows(headerId, headerIndex);
    });
  });

  // fetch data and populate table
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((data) => {
      // "clean" and trim the data
      const cleanData = data.map((item) => {
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
        const cleanLastName = lastName
          .replace(/[^a-zA-Z\-]/g, "")
          .toLowerCase();
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

      // sort the data by last name, then first name
      cleanData.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) {
          return lastNameCompare;
        } else {
          return a.firstName.localeCompare(b.firstName);
        }
      });

      // select table body
      const tableBody = document.querySelector("#studentTable tbody");
      tableBody.innerHTML = "";

      // create table rows
      const rowTemplate = document.querySelector("#table-row-template");
      cleanData.forEach((student) => {
        const row = rowTemplate.content.cloneNode(true);
        const lastNameCell = row.querySelector(".last-name");
        const firstNameCell = row.querySelector(".first-name");
        const houseCell = row.querySelector(".house");
        const genderCell = row.querySelector(".gender");

        lastNameCell.textContent = student.lastName;
        firstNameCell.textContent = student.firstName;
        houseCell.textContent = student.house;
        genderCell.textContent = student.gender;

        // create click event listener to display pop-up
        row.addEventListener("click", () => {
          let studentName = student.firstName;
          if (student.middleName) {
            studentName += ` ${student.middleName}`;
          }
          if (student.nickname) {
            studentName += ` "${student.nickname}"`;
          }
          studentName += ` ${student.lastName}`;
          const studentHouse = student.house;
          const studentGender = student.gender;
          // const studentNickname = student.nickname || "";

          // create pop-up content
          const popup = document.createElement("div");
          popup.classList.add("popup");

          const closeButton = document.createElement("button");
          closeButton.classList.add("popup__close");
          closeButton.textContent = "X";
          closeButton.addEventListener("click", () => {
            popup.remove();
          });
          const img = document.createElement("img");
          img.src = `img/${student.lastName}_${student.firstName[0]}.png`;
          img.alt = student.firstName + " " + student.lastName;
          popup.appendChild(img);

          const nameHeader = document.createElement("h2");
          nameHeader.textContent = studentName;

          const housePara = document.createElement("p");
          housePara.textContent = `House: ${studentHouse}`;

          const genderPara = document.createElement("p");
          genderPara.textContent = `Gender: ${studentGender}`;

          // const nicknamePara = document.createElement("p");
          // nicknamePara.textContent = `Nickname: ${studentNickname}`;

          popup.appendChild(closeButton);
          popup.appendChild(img);
          popup.appendChild(nameHeader);
          popup.appendChild(housePara);
          popup.appendChild(genderPara);
          // popup.appendChild(nicknamePara);

          document.body.appendChild(popup);

          document.body.appendChild(popup);
        });

        tableBody.appendChild(row);
      });

      // add event listeners to table headers
      tableHeaders.forEach((header) => {
        header.addEventListener("click", () => {
          const headerId = header.id;
          const headerIndex = Array.from(tableHeaders).indexOf(header);
          sortTableRows(headerId, headerIndex);
        });
      });
    })
    .catch((error) => console.error(error));
});
