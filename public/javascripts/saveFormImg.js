function saveFormImg(formData, errorDivId, url, loadingDiv) {
  // Show loading indicator
  $(loadingDiv).show();
  $(loadingDiv).text("Loading...");

  console.log("Inside saveFormImg - about to send axios POST request");

  // Return the axios post request as a promise
  return axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Important for file uploads
      },
    })
    .then(function (response) {
      console.log("Response received from axios:", response);

      // Hide loading indicator on success
      $(loadingDiv).hide();

      const successMsg =
        response.data.message || "Form submitted successfully!";
      // alert(successMsg);
      $('#sucs1').modal('show');
      $(errorDivId)
        .removeClass("alert-danger")
        .addClass("alert-success")
        .text(successMsg)
        .show();

      return response.data; // Return data to allow promise chaining
    })
    .catch(function (error) {
      console.log("Error occurred in axios POST:", error);

      // Hide loading indicator on error
      $(loadingDiv).hide();

      // Extract error message from API response or set a default message
      const errorMsg = error.response?.data?.message || "An error occurred";

      alert(errorMsg);
      $(errorDivId)
        .removeClass("alert-success")
        .addClass("alert-danger")
        .text(errorMsg)
        .show();
      console.error("Error:", error);

      throw error; // Re-throw to propagate to calling code
    });
}
