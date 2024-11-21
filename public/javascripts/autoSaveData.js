function saveFormDataToLocalStorage(formId) {
  // Get the form element by ID
  const form = document.getElementById(formId);

  // Check if the form exists
  if (!form) {
    console.error(`Form with ID "${formId}" not found.`);
    return;
  }

  // Create an object to store form data
  const formData = {};

  // Iterate through all form elements
  for (let element of form.elements) {
    // Only store elements with a 'name' attribute and exclude buttons
    if (
      element.name &&
      element.type !== "button" &&
      element.type !== "submit"
    ) {
      formData[element.name] = element.value;
    }
  }

  // Use the URL and form ID as a unique key for localStorage
  const storageKey = `formData_${window.location.href}`;

  // Store the form data in localStorage
  localStorage.setItem(storageKey, JSON.stringify(formData));

  console.log(
    `Form data for "${formId}" has been saved to localStorage against URL "${window.location.href}".`
  );
}

function loadFormDataFromLocalStorage(formId) {
  // Get the form element by ID
  const form = document.getElementById(formId);

  if (!form) {
    console.error(`Form with ID "${formId}" not found.`);
    return;
  }

  // Use the URL and form ID as a unique key for localStorage
  const storageKey = `formData_${window.location.href}`;

  // Retrieve the form data from localStorage
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    const formData = JSON.parse(savedData);

    // Populate the form fields with the saved data
    for (let element of form.elements) {
      if (element.name && formData[element.name] !== undefined) {
        element.value = formData[element.name];
      }
    }

    console.log(
      `Form data for "${formId}" has been loaded from localStorage for URL "${window.location.href}".`
    );
  } else {
    console.log(
      `No saved data found for form "${formId}" on URL "${window.location.href}".`
    );
  }

  document.getElementById(formId).addEventListener("submit", () => {
    localStorage.removeItem(`formData_${window.location.href}`);
  });
}
