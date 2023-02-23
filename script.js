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

    // create table rows
    const tableBody = document.querySelector("#studentTable tbody");
    cleanData.forEach((student) => {
      const row = document.createElement("tr");
      const firstNameCell = document.createElement("td");
      firstNameCell.textContent = student.firstName;
      row.appendChild(firstNameCell);

      const lastNameCell = document.createElement("td");
      lastNameCell.textContent = student.lastName;
      row.appendChild(lastNameCell);

      const middleNameCell = document.createElement("td");
      middleNameCell.textContent = student.middleName;
      row.appendChild(middleNameCell);

      const nicknameCell = document.createElement("td");
      nicknameCell.textContent = student.nickname || "-";
      row.appendChild(nicknameCell);

      const houseCell = document.createElement("td");
      houseCell.textContent = student.house;
      row.appendChild(houseCell);

      const genderCell = document.createElement("td");
      genderCell.textContent = student.gender;
      row.appendChild(genderCell);

      tableBody.appendChild(row);
    });
  })
  .catch((error) => console.error(error));
