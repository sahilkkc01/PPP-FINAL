function saveForm(formData, errorDivId, url, loadingDiv) {
  // Show loading indicator
  $(loadingDiv).show().text("Loading...");

  // Send POST request using axios with JSON data
  axios
    .post(url, formData, {
      headers: {
        "Content-Type": "application/json", // Set header to application/json
      },
    })
    .then(function (response) {
      // Hide loading indicator on success
      $(loadingDiv).hide();

      // Display success message in both alert and error div
      const successMsg =
        response.data.message || "Form submitted successfully!";
      // alert(successMsg);
      $('#sucs1').modal('show');
      $(errorDivId)
        .removeClass("alert-danger")
        .addClass("alert-success")
        .text(successMsg)
        .show();
      console.log("Response:", response.data);
    })
    .catch(function (error) {
      // Hide loading indicator on error
      $(loadingDiv).hide();

      // Extract error message from API response or set a default message
      const errorMsg = error.response?.data?.message || "An error occurred";

      // Display error message in both alert and error div
      alert(errorMsg);
      $(errorDivId)
        .removeClass("alert-success")
        .addClass("alert-danger")
        .text(errorMsg)
        .show();
      console.error("Error:", error);
    });
}
