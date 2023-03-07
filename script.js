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

    
    
  // select table body
    const tableBody = document.querySelector("#studentTable tbody");

    // create table rows
    cleanData.forEach((student) => {
      const row = document.createElement("tr");

      // create first name cell
      const firstNameCell = document.createElement("td");
      firstNameCell.textContent = student.firstName;
      row.appendChild(firstNameCell);

      // create last name cell
      const lastNameCell = document.createElement("td");
      lastNameCell.textContent = student.lastName;
      row.appendChild(lastNameCell);

      // create house cell
      const houseCell = document.createElement("td");
      houseCell.textContent = student.house;
      row.appendChild(houseCell);

      // create gender cell
      const genderCell = document.createElement("td");
      genderCell.textContent = student.gender;
      row.appendChild(genderCell);

  // create click event listener to display pop-up
row.addEventListener("click", () => {
  let fullName = student.firstName + " " + student.lastName;
  if (student.nickname) {
    fullName += ` "${student.nickname}"`;
  }
  if (student.middleName) {
    fullName += ` ${student.middleName}`;
  }
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

  const nameHeader = document.createElement("h2");
  nameHeader.textContent = fullName;

  const housePara = document.createElement("p");
  housePara.textContent = `House: ${studentHouse}`;

  const genderPara = document.createElement("p");
  genderPara.textContent = `Gender: ${studentGender}`;

  // const nicknamePara = document.createElement("p");
  // nicknamePara.textContent = `Nickname: ${studentNickname}`;

  popup.appendChild(closeButton);
  popup.appendChild(nameHeader);
  popup.appendChild(housePara);
  popup.appendChild(genderPara);
  // popup.appendChild(nicknamePara);
  
  document.body.appendChild(popup);
});


  tableBody.appendChild(row);
});


    
  })
  .catch((error) => console.error(error));
