fetch("https://petlatkea.dk/2021/hogwarts/students.json")
  .then((response) => response.json())
  .then((data) => {
    // "clean" and trim data
    const cleanData = data.map((item) => {
      const fullname = item.fullname.trim();
      const house = item.house.trim().toLowerCase();
      const gender = item.gender.trim().toLowerCase();
      const [firstName, ...middleAndLastName] = fullname.split(" ");
      let lastName = "";
      let middleName = "";
      let nickname = fullname.match(/\"(.*?)\"/)?.[1];

      // fix for when the lastname string is empty
      if (middleAndLastName.length === 0) {
        lastName = "";
      } else {
        lastName = middleAndLastName.pop();
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
        house: house.toLowerCase(),
        gender: gender.toLowerCase(),
      };
    });

    console.log(cleanData);
  })
  .catch((error) => console.error(error));
