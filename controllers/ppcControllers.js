// controller.js
const md5 = require("md5");
const CryptoJS = require("crypto-js");
const { Op, Sequelize } = require("sequelize");
const crypto = require("crypto");
const sjcl = require("sjcl");
const nodemailer = require("nodemailer");

// Encryption function
function encryptDataForUrl(data) {
  // Encrypt data with the secret key
  const encrypted = sjcl.encrypt("llppc", data);

  // Base64-encode the encrypted JSON string for URL safety
  return encodeURIComponent(btoa(encrypted));
}

// Decryption function
function decryptData(encodedEncryptedData, secretKey) {
  try {
    // Decode the Base64-encoded data from the URL
    const encryptedData = atob(decodeURIComponent(encodedEncryptedData));

    // Decrypt using SJCL and return the result
    return sjcl.decrypt(secretKey, encryptedData);
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null; // Handle or return as needed
  }
}

function getNextDateForDay(dayName) {
  const daysOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const currentDayIndex = new Date().getDay(); // Current day index (0-6)
  const targetDayIndex = daysOfWeek[dayName]; // Target day index
  console.log(dayName);

  if (targetDayIndex === undefined) {
    throw new Error(
      "Invalid day name. Please provide a valid day, e.g., 'Monday'."
    );
  }

  // If today is the target day, return today's date
  if (currentDayIndex === targetDayIndex) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Calculate days until the next occurrence
  const daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7 || 7;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilTarget);

  // Format the next date as YYYY-MM-DD
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, "0");
  const day = String(nextDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const {
  Clinic,
  Doctors,
  Speciality,
  Symptoms,
  Tests,
  Services,
  Items,
  Expenses,
  Patient,
  Staff,
  EmrComplaints,
  EmrExamination,
  EmrHistory,
  EmrPrescription,
  EmrRecommendedTests,
  Bill,
  Appointment,
  Visit,
  doctor_staff_Status,
  ItemManager,
  ExpenseManager,
  PurchaseClient,
  NotificationTable,
  UserAppointment,
  UserNotification,
  SMSTemplate,
  DoctorTimeTable,
  CodeFormat,
  DeseaseTable,
  TestsTable,
  MedicineTable,
} = require("../models/ppcModels"); // Adjust the import based on your model files
const path = require("path");

const saveClinic = async (req, res) => {
  console.log("Form Data:", req.body);
  console.log("Uploaded File:", req.file);

  try {
    const { query, code, ...updateFields } = req.body;

    // If a file is uploaded, add the filename to updateFields as 'logo'
    updateFields.logo = req.file ? req.file.filename : null;

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Clinic.update(
        updateFields, // Use dynamic fields for updating
        { where: { code } } // Condition to find the record
      );

      if (updated) {
        res.status(200).json({ message: "Clinic data updated successfully!" });
      } else {
        res.status(404).json({ message: "Clinic not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingClinic = await Clinic.findOne({ where: { code } });
      if (existingClinic) {
        return res
          .status(409)
          .json({ message: "A clinic with this code already exists." });
      }

      // Create new record if no duplicate is found
      const clinicData = await Clinic.create({
        ...req.body,
        logo: updateFields.logo,
      });
      res
        .status(200)
        .json({ message: "Clinic data saved successfully!", clinicData });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveDoctor = async (req, res) => {
  console.log("Form Data:", req.body);
  console.log("Uploaded File:", req.file);

  try {
    const { query, code, ...updateFields } = req.body;
    const tableData = [];
    // console.log(req.body.timeTable);
    let timeTable = req.body.timeTable;
    // console.log(timeTable);
    if (timeTable) {
      timeTable = JSON.parse(timeTable);
    }

    // If a file is uploaded, add the filename to updateFields as 'image'
    updateFields.image = req.file ? req.file.filename : null;

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Doctors.update(
        {
          name: req.body.name,
          qualification: req.body.qualification,
          speciality: req.body.speciality,
          mobile: req.body.mobile,
          email: req.body.email,
        },
        {
          where: { code },
        }
      );

      console.log("hello: ");

      if (updated) {
        const updatedDoctor = await Doctors.findOne({ where: { code } });
        await DoctorTimeTable.destroy({
          where: { doctorId: updatedDoctor.id },
        });
        Object.entries(timeTable).forEach(([key, value]) => {
          console.log(key, value);
          if (key === "All") {
            const days = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ];
            days.forEach((day) => {
              tableData.push({
                doctorId: updatedDoctor.id,
                dayType: day,
                timeTable: value,
                slotTiming: parseInt(req.body.timeSlot),
              });
            });
          } else {
            tableData.push({
              doctorId: updatedDoctor.id,
              dayType: key,
              timeTable: value,
              slotTiming: parseInt(req.body.timeSlot),
            });
          }
        });
        console.log(tableData, "hello", req.body.timeSlot);

        if (tableData.length) {
          await DoctorTimeTable.bulkCreate(tableData);
        }
        res.status(200).json({ message: "Doctor data updated successfully!" });
      } else {
        res.status(404).json({ message: "Doctor not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingDoctor = await Doctors.findOne({ where: { code } });
      if (existingDoctor) {
        return res
          .status(409)
          .json({ message: "A doctor with this code already exists." });
      }

      const body = {
        code: req.body.code,
        name: req.body.name,
        qualification: req.body.qualification,
        speciality: req.body.speciality,
        mobile: req.body.mobile,
        email: req.body.email,
      };

      // Create new record if no duplicate is found
      const doc = await Doctors.create({ ...body, image: updateFields.image });
      Object.entries(timeTable).forEach(([key, value]) => {
        tableData.push({
          doctorId: doc.id,
          dayType: key,
          timeTable: value,
          slotTiming: parseInt(req.body.timeSlot),
        });
      });
      if (tableData.length) {
        await DoctorTimeTable.bulkCreate(tableData);
      }
      res.status(200).json({ message: "Doctor data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const savePatient = async (req, res) => {
  console.log("Form Data:", req.body);
  console.log("Uploaded Files:", req.files);

  try {
    const { cid, query, code, markVisit, ...updateFields } = req.body;

    // If files are uploaded, add the filenames to the updateFields
    updateFields.image = req.files?.image ? req.files.image[0].filename : "";
    updateFields.report = req.files?.report ? req.files.report[0].filename : "";

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Patient.update(updateFields, { where: { code } });
      const data = await Patient.findOne({ where: { code } });
      const [updated2] = await EmrExamination.update(
        {
          heightFeet: parseFloat(req.body.height_Feet) || null,
          weightKg: parseFloat(req.body.weight_Kg) || null,
          temperature: parseFloat(req.body.temperature) || null,
          pulse: parseInt(req.body.pulse) || null,
          bmi: parseFloat(req.body.bmi) || null,
          bloodPressure: req.body.bloodPressure || null,
          bloodGroup: req.body.bloodGroup || null,
        },
        { where: { patientId: data.id } }
      );

      if (updated) {
        res.status(200).json({ message: "Patient data updated successfully!" });
      } else {
        res.status(404).json({ message: "Patient not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingPatient = await Patient.findOne({ where: { code } });
      if (existingPatient) {
        return res
          .status(409)
          .json({ message: "A patient with this code already exists." });
      }

      // Create new patient record
      const newPatient = await Patient.create({
        ...updateFields,
        code,
        clinicid: req.session.clinicId || cid,
      });

      // Save the examination data in the EmrExamination table
      const examinationData = {
        patientId: newPatient.id,
        heightFeet: parseFloat(req.body.height_Feet) || null,
        weightKg: parseFloat(req.body.weight_Kg) || null,
        temperature: parseFloat(req.body.temperature) || null,
        pulse: parseInt(req.body.pulse) || null,
        bmi: parseFloat(req.body.bmi) || null,
        bloodPressure: req.body.bloodPressure || null,
        bloodGroup: req.body.bloodGroup || null,
      };

      await EmrExamination.create(examinationData);

      // If markVisit is on, create a visit entry with all available data
      if (markVisit === "on") {
        const currentDate = new Date();

        // Extract visit-related fields from the request body
        const visitData = {
          patientId: newPatient.id,
          date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD
          time: currentDate.toTimeString().split(" ")[0], // HH:MM:SS
          weight: req.body.weight_Kg || "",
          fever: req.body.temperature || "",
          bp: req.body.bloodPressure || "",
          sugar: req.body.sugar || "",
          bmi: req.body.bmi || "",
        };

        // Save the visit data
        await Visit.create(visitData);
        await Appointment.create({
          patientId: newPatient.id,
          doctorId: decryptData(decodeURIComponent(req.body.doctor), "llppc"),
          time: req.body.time_available,
          date: getNextDateForDay(req.body.day),
        });
      }

      res
        .status(200)
        .json({ message: "Patient data saved successfully!", newPatient });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveSpeciality = async (req, res) => {
  console.log("Form Data:", req.body);

  try {
    const { query, code, ...updateFields } = req.body;

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Speciality.update(
        updateFields, // Use dynamic fields for updating
        { where: { code } } // Condition to find the record
      );

      if (updated) {
        res.status(200).json({ message: "Data updated successfully!" });
      } else {
        res.status(404).json({ message: "Speciality not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingSpeciality = await Speciality.findOne({ where: { code } });

      if (existingSpeciality) {
        return res
          .status(409)
          .json({ message: "A speciality with this code already exists." });
      }

      // Create new record if no duplicate is found
      await Speciality.create(req.body);
      res.status(200).json({ message: "Data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveStaff = async (req, res) => {
  console.log("Form Data:", req.body);

  try {
    const { query, code, role, password, ...updateFields } = req.body;

    // Encrypt the password
    const encryptedPassword = md5(password);
    updateFields.password = encryptedPassword; // Assign the encrypted password

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Staff.update(
        updateFields, // Use dynamic fields for updating
        { where: { code } } // Condition to find the record
      );

      if (updated) {
        res.status(200).json({ message: "Data updated successfully!" });
      } else {
        res.status(404).json({ message: "Staff not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingStaff = await Staff.findOne({ where: { code } });

      if (existingStaff) {
        return res
          .status(409)
          .json({ message: "A Staff with this code already exists." });
      }

      // Add parsed role and encrypted password to req.body for new record creation
      req.body.role = updateFields.role;
      req.body.password = encryptedPassword; // Store the encrypted password

      // Create new record if no duplicate is found
      await Staff.create(req.body);
      res.status(200).json({ message: "Data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveSymptoms = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Symptoms.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } } // Condition to find the record
      );

      if (updated) {
        res
          .status(200)
          .json({ message: "Symptoms data updated successfully!" });
      } else {
        res.status(404).json({ message: "Symptoms not found for update." });
      }
    } else {
      // Check for duplicate 'code' before creating a new record
      const existingSymptom = await Symptoms.findOne({ where: { code } });
      if (existingSymptom) {
        return res
          .status(409)
          .json({ message: "A symptom with this code already exists." });
      }

      // Create new record if no duplicate is found
      await Symptoms.create(req.body);
      res.status(200).json({ message: "Symptoms data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveTest = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await Tests.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } }
      );

      if (updated) {
        res.status(200).json({ message: "Test data updated successfully!" });
      } else {
        res.status(404).json({ message: "Test not found for update." });
      }
    } else {
      const existingTest = await Tests.findOne({ where: { code } });
      if (existingTest) {
        return res
          .status(409)
          .json({ message: "A test with this code already exists." });
      }

      await Tests.create(req.body);
      res.status(200).json({ message: "Test data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveService = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      const [updated] = await Services.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } }
      );

      if (updated) {
        res.status(200).json({ message: "Service data updated successfully!" });
      } else {
        res.status(404).json({ message: "Service not found for update." });
      }
    } else {
      const existingService = await Services.findOne({ where: { code } });
      if (existingService) {
        return res
          .status(409)
          .json({ message: "A service with this code already exists." });
      }

      await Services.create(req.body);
      res.status(200).json({ message: "Service data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveItem = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      const [updated] = await Items.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } }
      );

      if (updated) {
        res.status(200).json({ message: "Item data updated successfully!" });
      } else {
        res.status(404).json({ message: "Item not found for update." });
      }
    } else {
      const existingItem = await Items.findOne({ where: { code } });
      if (existingItem) {
        return res
          .status(409)
          .json({ message: "An item with this code already exists." });
      }

      await Items.create(req.body);
      res.status(200).json({ message: "Item data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

const saveExpense = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      const [updated] = await Expenses.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } }
      );

      if (updated) {
        res.status(200).json({ message: "Expense data updated successfully!" });
      } else {
        res.status(404).json({ message: "Expense not found for update." });
      }
    } else {
      const existingExpense = await Expenses.findOne({ where: { code } });
      if (existingExpense) {
        return res
          .status(409)
          .json({ message: "An expense with this code already exists." });
      }

      await Expenses.create(req.body);
      res.status(200).json({ message: "Expense data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};
const saveEmrComplaints = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { patientId, complaints } = req.body; // Extract patientId and complaints from request body

    // Create a new complaint entry for each submission
    await EmrComplaints.create({
      patientId: patientId,
      complaints: complaints, // Assuming `complaints` is an array of complaint objects
    });

    res.status(201).json({ message: "Complaint data saved successfully!" });
  } catch (error) {
    console.error("Error saving complaint data:", error);
    res
      .status(500)
      .json({ message: "Error saving complaint data", error: error.message });
  }
};

const saveEmrExamination = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { patientId, ...examinationData } = req.body; // Separate `patientId` and examination data

    // Check if an examination entry already exists for this patient
    const existingExamination = await EmrExamination.findOne({
      where: { patientId },
    });

    if (existingExamination) {
      // Update the existing examination record
      await existingExamination.update(examinationData); // Assumes `examinationData` fields match the model
      res
        .status(200)
        .json({ message: "Examination data updated successfully!" });
    } else {
      // Create new examination data
      await EmrExamination.create({
        patientId: patientId,
        ...examinationData, // Spread examination data fields for new entry
      });
      res.status(201).json({ message: "Examination data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving examination data:", error);
    res
      .status(500)
      .json({ message: "Error saving examination data", error: error.message });
  }
};

const saveEmrHistory = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { patientId, history } = req.body; // Extract `patientId` and `history` from the request body

    // Create a new history entry without checking for an existing record
    await EmrHistory.create({
      patientId,
      history,
    });

    res.status(201).json({ message: "History data saved successfully!" });
  } catch (error) {
    console.error("Error saving history data:", error);
    res
      .status(500)
      .json({ message: "Error saving history data", error: error.message });
  }
};

const saveEmrPrescriptions = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { patientId, prescriptions, prescribedComment } = req.body; // Extract relevant fields

    // Directly create a new prescription entry without checking for an existing one
    await EmrPrescription.create({
      patientId: patientId,
      prescriptions: prescriptions, // Set new prescriptions data
      prescribedComment: prescribedComment, // Set new comment
    });

    res.status(201).json({ message: "Prescription data saved successfully!" });
  } catch (error) {
    console.error("Error saving prescription data:", error);
    res.status(500).json({
      message: "Error saving prescription data",
      error: error.message,
    });
  }
};

const saveEmrRecommendedTests = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { patientId, tests, comment } = req.body; // Extract relevant fields

    // Directly create a new recommended tests record
    await EmrRecommendedTests.create({
      patientId: patientId,
      tests: tests, // Set tests data
      comment: comment, // Set common comment
    });

    res
      .status(201)
      .json({ message: "Recommended tests data saved successfully!" });
  } catch (error) {
    console.error("Error saving recommended tests data:", error);
    res.status(500).json({
      message: "Error saving recommended tests data",
      error: error.message,
    });
  }
};

const getSpeciality = async (req, res) => {
  try {
    const Alldata = await Speciality.findAll();
    const encData = Alldata.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ msg: "An error occurred while fetching details." });
  }
};

const getClinics = async (req, res) => {
  try {
    const allClinics = await Clinic.findAll();
    const encData = allClinics.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({ msg: "An error occurred while fetching clinics." });
  }
};

const getSymptoms = async (req, res) => {
  try {
    const allSymptoms = await Symptoms.findAll();
    const encData = allSymptoms.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    res.status(500).json({ msg: "An error occurred while fetching symptoms." });
  }
};

const getTests = async (req, res) => {
  try {
    const allTests = await Tests.findAll();
    const encData = allTests.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ msg: "An error occurred while fetching tests." });
  }
};
const getPurchaseClient = async (req, res) => {
  try {
    const allClient = await PurchaseClient.findAll();
    const encData = allClient.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ msg: "An error occurred while fetching Clients." });
  }
};

const getServices = async (req, res) => {
  try {
    const allServices = await Services.findAll();
    const encData = allServices.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ msg: "An error occurred while fetching services." });
  }
};

const getItems = async (req, res) => {
  try {
    const allItems = await Items.findAll();
    const encData = allItems.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ msg: "An error occurred while fetching items." });
  }
};

const getDoctors = async (req, res) => {
  try {
    const allDoctors = await Doctors.findAll();
    const encData = allDoctors.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ msg: "An error occurred while fetching doctors." });
  }
};

const getPatients = async (req, res) => {
  try {
    const allPatients = await Patient.findAll();
    const encData = allPatients.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
        pid: data.id,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ msg: "An error occurred while fetching patients." });
  }
};
const getExpenses = async (req, res) => {
  try {
    const allExpense = await Expenses.findAll();
    const encData = allExpense.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ msg: "An error occurred while fetching patients." });
  }
};
const getStaff = async (req, res) => {
  try {
    const allStaff = await Staff.findAll();
    const encData = allStaff.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching Staff:", error);
    res.status(500).json({ msg: "An error occurred while fetching Staff." });
  }
};
const getConsultation = async (req, res) => {
  try {
    const cons = await Services.findAll({
      where: { category: "General Consultation" },
    });
    console.log(cons);
    res.status(200).json(cons);
  } catch (error) {
    console.error("Error fetching Staff:", error);
    res.status(500).json({ msg: "An error occurred while fetching Staff." });
  }
};

// Controller function to fetch the latest recommended tests for a patient with MRP from the Tests model
const getLatestRecommendedTests = async (req, res) => {
  try {
    const { patientId } = req.query;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");

    // Check if the patientId is provided
    if (!decryptedId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Fetch the latest recommended test entry for the patient
    const latestTestEntry = await EmrRecommendedTests.findOne({
      where: { patientId: decryptedId },
      order: [["createdAt", "DESC"]], // Order by most recent
      limit: 1, // Get only the latest record
    });

    // If no test entry is found, return a 404 status
    if (!latestTestEntry) {
      return res
        .status(404)
        .json({ error: "No recommended tests found for the selected patient" });
    }

    // Parse the `tests` array from latestTestEntry, handling if already an object
    const tests =
      typeof latestTestEntry.tests === "string"
        ? JSON.parse(latestTestEntry.tests)
        : latestTestEntry.tests;

    // Extract test names or codes for querying `Tests`
    const testNames = tests.map((test) => test.test);

    // Fetch corresponding `Tests` entries with MRP and other details
    const testsWithMrp = await Tests.findAll({
      where: { name: testNames },
      attributes: ["name", "mrp"], // Only fetch `name` and `mrp` columns
    });

    // Format the response to include test details with MRP and comment
    const formattedResponse = {
      tests: testsWithMrp.map((test) => ({
        name: test.name,
        price: test.mrp,
      })),
      comment: latestTestEntry.comment,
    };

    console.log(formattedResponse);
    // Send the formatted response
    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching latest recommended tests:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching recommended tests" });
  }
};

const getLatestPrescription = async (req, res) => {
  try {
    const { patientId } = req.query;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");

    if (!decryptedId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    // Fetch the latest prescription entry for the patient
    const latestPrescription = await EmrPrescription.findOne({
      where: { patientId: decryptedId },
      order: [["createdAt", "DESC"]],
      limit: 1,
    });

    if (!latestPrescription) {
      return res
        .status(404)
        .json({ error: "No prescription data found for the selected patient" });
    }

    // Parse prescriptions data from JSON if needed
    const prescriptions =
      typeof latestPrescription.prescriptions === "string"
        ? JSON.parse(latestPrescription.prescriptions)
        : latestPrescription.prescriptions;

    // Fetch prices for each drug from the Items table
    const enrichedPrescriptions = await Promise.all(
      prescriptions.map(async (prescription) => {
        const item = await Items.findOne({
          where: { name: prescription.drug },
          attributes: ["sellingPrice"],
        });
        return {
          ...prescription,
          price: item ? item.sellingPrice : "N/A", // Attach price or set 'N/A' if not found
        };
      })
    );

    const formattedResponse = {
      prescriptions: enrichedPrescriptions,
      comment: latestPrescription.prescribedComment,
    };

    // console.log(formattedResponse);
    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching latest prescription:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching prescription data" });
  }
};

const saveBill = async (req, res) => {
  console.log(req.body);
  try {
    // Extract data from request body
    const {
      patientId,
      consultation,
      test,
      pharmacy,
      totalAmount,
      paymentMode,
      discount,
      netAmount,
    } = req.body;

    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");

    // Validate required fields
    if (!decryptedId || !totalAmount || !consultation) {
      return res.status(400).json({
        error: "Patient ID, consultation, and total amount are required.",
      });
    }

    // Ensure discount is a valid number
    const validatedDiscount = parseFloat(discount) || 0;

    // Create the bill record
    const newBill = await Bill.create({
      patientId: decryptedId,
      consultation,
      test: test || [], // Default to empty array if no tests
      pharmacy: pharmacy || [], // Default to empty array if no pharmacy items
      totalAmount,
      paymentMode,
      discount: validatedDiscount, // Use the validated discount value
      netAmount,
    });

    // Generate the bill number based on the new bill's ID
    const billNo = `BILL_${newBill.id}`;

    // Update the newly created bill with the bill number
    newBill.bill_no = billNo;
    await newBill.save();
    const encId = encryptDataForUrl(newBill.id.toString());

    // Respond with success and the updated bill data
    res.status(201).json({ message: "Bill saved successfully", id: encId });
  } catch (error) {
    console.error("Error saving bill:", error);
    res.status(500).json({ error: "An error occurred while saving the bill." });
  }
};

const getBills = async (req, res) => {
  try {
    // Fetch all bills
    const allBills = await Bill.findAll();

    // Fetch all patients matching the patient IDs in the bills
    const patientIds = allBills.map((bill) => bill.patientId);
    const patients = await Patient.findAll({
      where: { id: patientIds },
      attributes: ["id", "name", "age", "gender", "mobile"],
    });

    // Create a map of patient details for easy lookup by patientId
    const patientMap = patients.reduce((map, patient) => {
      map[patient.id] = patient.toJSON();
      return map;
    }, {});

    // Combine bill and patient data
    const encData = allBills.map((bill) => {
      const encId = encryptDataForUrl(bill.id.toString());
      return {
        ...bill.toJSON(),
        id: encId,
        patient: patientMap[bill.patientId] || null, // Attach patient data or null if not found
      };
    });

    // console.log(encData)
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ msg: "An error occurred while fetching items." });
  }
};

const getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.query;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");

    // Validate patientId
    if (!decryptedId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    // Fetch all bills for the specified patient
    const bills = await Bill.findAll({
      where: { patientId: decryptedId },
      order: [["createdAt", "DESC"]], // Order by date, latest first
    });

    // Check if bills exist for the patient
    if (!bills.length) {
      return res
        .status(404)
        .json({ error: "No bills found for this patient." });
    }

    // Encrypt each bill's id
    const encData = bills.map((bill) => {
      const encId = encryptDataForUrl(bill.id.toString());
      return {
        ...bill.toJSON(),
        id: encId,
      };
    });

    // Return the encrypted bills data
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching patient bills:", error);
    res.status(500).json({ error: "An error occurred while fetching bills." });
  }
};

const saveVisit = async (req, res) => {
  try {
    console.log(req.body);

    // Extract data from the request body
    const {
      patientId,
      visitDate,
      visitTime,
      weight,
      height,
      fever,
      bp,
      sugar,
      bmi,
      doctor,
    } = req.body;

    // Decrypt the patient ID
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");
    const decryptedDoctorId = decryptData(decodeURIComponent(doctor), "llppc");


    // Validate required fields
    if (!decryptedId || !visitDate || !visitTime) {
      return res.status(400).json({
        message: "Patient ID, visit date, and visit time are required.",
      });
    }

    const doctorDetails = await Doctors.findOne({
      where: { id: decryptedDoctorId },
      attributes: ["name"], // Fetch only the name to reduce data retrieval
    });
    // Save the visit in the database
    const newVisit = await Visit.create({
      patientId: decryptedId,
      date: visitDate,
      time: visitTime,
      weight,
      height,
      fever,
      bp,
      sugar,
      bmi,
      doctor: doctorDetails.name,
    });

    const appointment = await Appointment.create({
      patientId: decryptedId,
      doctorId: decryptData(decodeURIComponent(doctor), "llppc"),
      date: visitDate,
      time: visitTime,
    });

    // Send a success response
    res.status(200).json({
      message: "Visit saved successfully!",
      visit: newVisit,
      appointment: appointment,
    });
    await sendEmailTemplate(decryptedId, "send", req);
  } catch (error) {
    console.error("Error saving visit:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the visit." });
  }
};

const saveAppointment = async (req, res) => {
  console.log("Received data:", req.body);
  try {
    const { patientId, appointmentDate, doctorId } = req.body;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");

    // Validate required fields
    if (!patientId || !appointmentDate) {
      return res
        .status(400)
        .json({ message: "Patient ID and appointment date are required." });
    }

    // Get current time in HH:MM:SS format
    const currentTime = new Date().toTimeString().split(" ")[0];

    // Save appointment in the database
    const newAppointment = await Appointment.create({
      patientId: patientId,
      date: appointmentDate,
      time: currentTime,
      doctorId,
    });

    // Send a success response
    res.status(200).json({
      message: "Appointment saved successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the appointment." });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");
    console.log(decryptedId);
    // Validate patientId
    if (!decryptedId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    // Fetch all appointments for the specified patient
    const appointments = await Appointment.findAll({
      where: { patientId: decryptedId },
      order: [["date", "DESC"]], // Order by date, latest first
    });

    // Check if appointments exist for the patient
    if (!appointments.length) {
      return res
        .status(404)
        .json({ error: "No appointments found for this patient." });
    }

    // Encrypt each appointment's id
    const encData = appointments.map((appointment) => {
      const encId = encryptDataForUrl(appointment.id.toString());
      return {
        ...appointment.toJSON(),
        id: encId,
      };
    });

    // Return the encrypted appointments data
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching appointments." });
  }
};

const getPatientVisits = async (req, res) => {
  try {
    const { patientId } = req.query;
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");
    console.log(decryptedId);

    // Validate patientId
    if (!decryptedId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    // Fetch all visits for the specified patient
    const visits = await Visit.findAll({
      where: { patientId: decryptedId },
      order: [["date", "DESC"]], // Order by date, latest first
    });

    // Check if visits exist for the patient
    if (!visits.length) {
      return res
        .status(404)
        .json({ error: "No visits found for this patient." });
    }

    // Encrypt each visit's id
    const encData = visits.map((visit) => {
      const encId = encryptDataForUrl(visit.id.toString());
      return {
        ...visit.toJSON(),
        id: encId,
      };
    });

    // Return the encrypted visits data
    res.status(200).json(encData);
  } catch (error) {
    console.error("Error fetching patient visits:", error);
    res.status(500).json({ error: "An error occurred while fetching visits." });
  }
};

const search = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `${searchTerm}%`, // Searches by first name, case-insensitive for MySQL
            },
          },
          {
            mobile: {
              [Op.like]: `${searchTerm}%`, // Searches by MR number, case-insensitive for MySQL
            },
          },
        ],
      },
    });
    const encData = patients.map((data) => {
      const encId = encryptDataForUrl(data.id.toString());
      return {
        ...data.toJSON(),
        id: encId,
      };
    });

    if (patients.length > 0) {
      return res.status(200).json(encData);
    }

    return res.status(404).json({ message: "No results found." });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while searching" });
    console.log(err);
  }
};

const getPatientById = async (req, res) => {
  try {
    const patientId = req.query.id; // Extract encrypted ID from URL
    console.log("id", patientId);
    const decryptedId = decryptData(decodeURIComponent(patientId), "llppc");
    console.log(decryptedId);

    if (!decryptedId) {
      return res.status(404).json({ message: "Invalid patient ID" });
    }

    const patient = await Patient.findOne({
      where: { id: decryptedId },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Encrypt the ID before sending the response
    const encId = encryptDataForUrl(patient.id.toString());
    const encPatientData = {
      ...patient.toJSON(),
      id: encId, // Replace decrypted ID with the encrypted ID
    };

    res.status(200).json(encPatientData);
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getTodaysAppointments = async (req, res) => {
  try {
    // Define today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Define date range for the next 7 days
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    // Fetch today's appointments
    const todaysAppointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    // Fetch appointments for the next 7 days
    const weeklyAppointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: today,
          [Op.lt]: endOfWeek,
        },
      },
    });

    // Extract unique patient IDs from both today's and weekly appointments
    const patientIds = [
      ...new Set([
        ...todaysAppointments.map((app) => app.patientId),
        ...weeklyAppointments.map((app) => app.patientId),
      ]),
    ];

    // Fetch patient details for each unique patient ID
    const patients = await Patient.findAll({
      where: { id: patientIds },
    });

    // Create a lookup with unencrypted patientId as the key and encrypted id in the data
    const patientLookup = Object.fromEntries(
      patients.map((patient) => {
        const encryptedId = encryptDataForUrl(patient.id.toString()); // Encrypt the ID
        return [
          patient.id,
          {
            ...patient.toJSON(),
            id: encryptedId, // Include the encrypted ID in the data
          },
        ];
      })
    );

    // Fetch the last visit and next appointment for each patient
    const visits = await Promise.all(
      patientIds.map(async (patientId) => {
        // Last visit before today
        const lastVisit = await Visit.findOne({
          where: {
            patientId: patientId,
            date: { [Op.lt]: today },
          },
          order: [["date", "DESC"]],
        });

        // Next upcoming appointment after today
        const upcomingAppointment = await Appointment.findOne({
          where: {
            patientId: patientId,
            date: { [Op.gt]: tomorrow },
          },
          order: [["date", "ASC"]],
        });

        return {
          patientId,
          lastVisit: lastVisit ? lastVisit.toJSON() : null,
          upcomingAppointment: upcomingAppointment
            ? upcomingAppointment.toJSON()
            : null,
        };
      })
    );

    // Create a lookup for visit data by patientId
    const visitLookup = Object.fromEntries(
      visits.map((visit) => [visit.patientId, visit])
    );

    // Map today's appointments with patient details, last visit, and upcoming appointment
    const appointmentsWithPatientDetails = todaysAppointments.map(
      (appointment) => ({
        ...appointment.toJSON(),
        patient: patientLookup[appointment.patientId] || null,
        lastVisit: visitLookup[appointment.patientId]?.lastVisit || null,
        upcomingAppointment:
          visitLookup[appointment.patientId]?.upcomingAppointment || null,
      })
    );

    // Map weekly appointments with patient details, last visit, and upcoming appointment
    const weeklyAppointmentsWithPatientDetails = weeklyAppointments.map(
      (appointment) => ({
        ...appointment.toJSON(),
        patient: patientLookup[appointment.patientId] || null,
        lastVisit: visitLookup[appointment.patientId]?.lastVisit || null,
        upcomingAppointment:
          visitLookup[appointment.patientId]?.upcomingAppointment || null,
      })
    );

    // Respond with both today's appointments and weekly appointments
    res.status(200).json({
      todaysAppointments: appointmentsWithPatientDetails,
      weeklyAppointments: weeklyAppointmentsWithPatientDetails,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "An error occurred while fetching appointments.",
    });
  }
};

const getStaffStatus = async (req, res) => {
  try {
    // Step 1: Fetch all records from doctor_staff_Status
    const staffs = await doctor_staff_Status.findAll();

    // Step 2: Get all doctors and staff from the database
    const allDoctors = await Doctors.findAll({
      attributes: ["id", "name"],
    });

    const userAppointments = await UserAppointment.findAll();

    // Step 2: Fetch all patients from the Patient table
    const allPatients = await Patient.findAll({
      attributes: ["id", "name", "email", "mobile"],
    });

    const allStaffs = await Staff.findAll({
      attributes: ["id", "name"],
    });

    // Step 3: Extract IDs from fetched doctors and staff
    const allDoctorIds = allDoctors.map((doc) => doc.id);
    const allStaffIds = allStaffs.map((staff) => staff.id);

    // Step 4: Separate existing doctor and staff IDs from doctor_staff_Status
    const existingDoctorIds = new Set(
      staffs
        .filter((s) => s.staffType === "doc")
        .map((s) => parseInt(s.doctorStaffId))
    );
    const existingStaffIds = new Set(
      staffs
        .filter((s) => s.staffType === "staff")
        .map((s) => parseInt(s.doctorStaffId))
    );

    // Step 5: Find missing doctor and staff IDs
    const missingDoctors = allDoctorIds.filter(
      (id) => !existingDoctorIds.has(id)
    );
    const missingStaffs = allStaffIds.filter((id) => !existingStaffIds.has(id));

    // Step 6: Prepare bulk insert data
    const missingDoctorRecords = missingDoctors.map((id) => ({
      doctorStaffId: id,
      staffType: "doc",
      ConSMS: false,
      ConEmail: false,
      SchSMS: false,
      SchEmail: false,
      pushNotify: false,
      OnAppointmentSMS: false,
    }));

    const missingStaffRecords = missingStaffs.map((id) => ({
      doctorStaffId: id,
      staffType: "staff",
      ConSMS: false,
      ConEmail: false,
      SchSMS: false,
      SchEmail: false,
      pushNotify: false,
      OnAppointmentSMS: false,
    }));

    // Step 7: Bulk insert missing records using `bulkCreate`
    if (missingDoctorRecords.length > 0) {
      await doctor_staff_Status.bulkCreate(missingDoctorRecords);
    }
    if (missingStaffRecords.length > 0) {
      await doctor_staff_Status.bulkCreate(missingStaffRecords);
    }

    // Step 8: Fetch the updated list of doctor_staff_Status
    const updatedStaffs = await doctor_staff_Status.findAll();

    // Step 9: Map doctor status
    const doctorStatus = updatedStaffs
      .filter((staff) => staff.staffType === "doc")
      .map((staff) => {
        const docName = allDoctors.find(
          (d) => d.id.toString() === staff.doctorStaffId
        );
        return {
          id: staff.id,
          name: docName ? docName.name : "Unknown",
          ConSMS: staff.ConSMS,
          ConEmail: staff.ConEmail,
          SchSMS: staff.SchSMS,
          SchEmail: staff.SchEmail,
          pushNotify: staff.pushNotify,
        };
      });

    // Step 10: Map staff status
    const staffStatus = updatedStaffs
      .filter((staff) => staff.staffType === "staff")
      .map((staff) => {
        const staffName = allStaffs.find(
          (s) => s.id.toString() === staff.doctorStaffId
        );
        return {
          id: staff.id,
          name: staffName ? staffName.name : "Unknown",
          SchSMS: staff.SchSMS,
          SchEmail: staff.SchEmail,
          OnAppointmentSMS: staff.OnAppointmentSMS,
        };
      });

    const allPatientIds = allPatients.map((patient) => patient.id);

    // Step 4: Get existing patient IDs from UserAppointment
    const existingPatientIds = new Set(
      userAppointments.map((appointment) => parseInt(appointment.id))
    );

    // Step 5: Find missing patient IDs
    const missingPatientIds = allPatientIds.filter(
      (id) => !existingPatientIds.has(id)
    );

    // Step 6: Prepare bulk insert data for missing patient records
    const missingAppointments = missingPatientIds.map((id) => ({
      id: id,
      appntSMS: false,
      appntMail: false,
      reprtWatsp: false,
      rprtMail: false,
      prscrpWatsp: false,
      prscrpMail: false,
      billMail: false,
      billWatsp: false,
    }));

    // Step 7: Insert missing records using `bulkCreate`
    if (missingAppointments.length > 0) {
      await UserAppointment.bulkCreate(missingAppointments);
    }

    // Step 8: Fetch the updated list of UserAppointment
    const updatedAppointments = await UserAppointment.findAll();

    // Step 9: Map user appointment status
    const userAppointmentStatus = updatedAppointments.map((appointment) => {
      const patient = allPatients.find(
        (p) => p.id.toString() === appointment.id.toString()
      );
      return {
        id: appointment.id,
        name: patient ? patient.name : "Unknown",
        email: patient ? patient.email : "Unknown",
        mobile: patient ? patient.mobile : "Unknown",
        appntSMS: appointment.appntSMS,
        appntMail: appointment.appntMail,
        reprtWatsp: appointment.reprtWatsp,
        rprtMail: appointment.rprtMail,
        prscrpWatsp: appointment.prscrpWatsp,
        prscrpMail: appointment.prscrpMail,
        billMail: appointment.billMail,
        billWatsp: appointment.billWatsp,
      };
    });

    // Step 12: Get existing staff and doctor IDs from NotificationTable
    const existingNotificationStaffIds = new Set(
      (await NotificationTable.findAll({ attributes: ["staffId"] })).map(
        (n) => n.staffId
      )
    );

    // Step 13: Combine all doctor and staff IDs
    const combinedStaffIds = [...allDoctorIds, ...allStaffIds];

    // Step 14: Find missing IDs that are not in NotificationTable
    const missingNotificationIds = combinedStaffIds.filter(
      (id) => !existingNotificationStaffIds.has(id)
    );

    // Step 15: Prepare bulk insert data for missing records in NotificationTable
    const missingNotificationRecords = missingNotificationIds.map((id) => ({
      staffId: id,
      ConSMS: false,
      ConEmail: false,
      SchSMS: false,
      SchEmail: false,
      OnAppointmentSMS: false,
      pushNotify: false,
      date: new Date(),
    }));

    // Step 16: Insert missing records using `bulkCreate`
    if (missingNotificationRecords.length > 0) {
      await NotificationTable.bulkCreate(missingNotificationRecords);
      console.log(
        "Inserted missing notification records:",
        missingNotificationRecords.length
      );
    }

    // Step 12: Get existing user IDs from UserNotification
    const existingUserNotificationIds = new Set(
      (await UserNotification.findAll({ attributes: ["userId"] })).map(
        (u) => u.userId
      )
    );

    // Step 13: Get all user IDs from the Patient table
    const allUserIds = allPatients.map((patient) => patient.id.toString());

    // Step 14: Find missing user IDs that are not in UserNotification
    const missingUserNotificationIds = allUserIds.filter(
      (id) => !existingUserNotificationIds.has(id)
    );

    // Step 15: Prepare bulk insert data for missing user records in UserNotification
    const missingUserNotificationRecords = missingUserNotificationIds.map(
      (userId) => ({
        userId: userId,
        appntSMS: false,
        appntMail: false,
        reprtWatsp: false,
        rprtMail: false,
        prscrpWatsp: false,
        prscrpMail: false,
        billMail: false,
        billWatsp: false,
      })
    );

    // Step 16: Insert missing records using `bulkCreate`
    if (missingUserNotificationRecords.length > 0) {
      await UserNotification.bulkCreate(missingUserNotificationRecords);
      console.log(
        "Inserted missing user notification records:",
        missingUserNotificationRecords.length
      );
    }

    // Step 11: Send the response
    res.status(200).json({ doctorStatus, staffStatus, userAppointmentStatus });
  } catch (err) {
    console.error("Error fetching staff status:", err);
    res.status(500).json({
      message: "An error occurred while fetching staff status.",
    });
  }
};

const getVisits = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const now = new Date();

    // Helper functions to get date ranges
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Base query conditions
    let baseConditions = patientId
      ? { patientId: parseInt(patientId, 10) }
      : {};

    baseConditions = doctorId
      ? {
          ...baseConditions,
          doctorId: parseInt(doctorId, 10),
        }
      : baseConditions;

    // Queries for visit counts
    const visitCounts = await Promise.all([
      // Today's visits
      Visit.count({
        where: {
          ...baseConditions,
          date: {
            [Op.gte]: startOfToday,
            [Op.lt]: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      // This week's visits
      Visit.count({
        where: {
          ...baseConditions,
          date: {
            [Op.gte]: startOfWeek,
            [Op.lt]: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // This month's visits
      Visit.count({
        where: {
          ...baseConditions,
          date: {
            [Op.gte]: startOfMonth,
            [Op.lt]: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      }),
      // Previous month's visits
      Visit.count({
        where: {
          ...baseConditions,
          date: {
            [Op.gte]: startOfPrevMonth,
            [Op.lt]: startOfMonth,
          },
        },
      }),
      // Total visits up till now
      Visit.count({
        where: {
          ...baseConditions,
          date: {
            [Op.lte]: now,
          },
        },
      }),
    ]);

    // Query for financial details
    const totalAmountResult = await Bill.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "totalPaidAmount"],
        [Sequelize.fn("SUM", Sequelize.col("paidAmount")), "PaidAmount"],
        [
          Sequelize.fn("SUM", Sequelize.col("advancePayment")),
          "AdvancePayment",
        ],
      ],
      where: baseConditions,
      raw: true,
    });

    // Destructure financial details with defaults
    const totalPaidAmount = totalAmountResult?.totalPaidAmount || 0;
    const totalAdvancePayment = totalAmountResult?.AdvancePayment || 0;
    const paidAmount = totalAmountResult?.PaidAmount || 0;

    // Send the counts as response
    res.status(200).json({
      patientId: patientId ? parseInt(patientId, 10) : null,
      totalAmount: totalPaidAmount,
      paidAmount: paidAmount,
      advancePayment: totalAdvancePayment,
      todayCount: visitCounts[0],
      thisWeekCount: visitCounts[1],
      thisMonthCount: visitCounts[2],
      prevMonthCount: visitCounts[3],
      totalVisits: visitCounts[4],
    });
  } catch (error) {
    console.error("Error fetching visit counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Fetch Items and Tests
const getItemsAndTests = async (req, res) => {
  try {
    // Fetch all items
    const allItems = await Items.findAll();
    const encryptedItems = allItems.map((item) => {
      const encId = encryptDataForUrl(item.id.toString());
      return {
        ...item.toJSON(),
        id: encId,
      };
    });

    // Fetch all tests
    const allTests = await Tests.findAll();
    const encryptedTests = allTests.map((test) => {
      const encId = encryptDataForUrl(test.id.toString());
      return {
        ...test.toJSON(),
        id: encId,
      };
    });

    // Combine results
    const response = {
      items: encryptedItems,
      tests: encryptedTests,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching items and tests:", error);
    res
      .status(500)
      .json({ msg: "An error occurred while fetching items and tests." });
  }
};

// Controller to save purchase items
const savePurchaseItem = async (req, res) => {
  console.log(req.body);
  try {
    const {
      date,
      voucherNo,
      client,
      items,
      grandTotal,
      paymentStatus,
      comment,
    } = req.body;

    // Create the purchase record
    const newPurchase = await ItemManager.create({
      date,
      voucherNo,
      client,
      items,
      grandTotal,
      paymentStatus,
      comment,
    });

    return res.status(201).json({
      message: "Purchase saved successfully.",
      data: newPurchase,
    });
  } catch (error) {
    console.error("Error saving purchase:", error);
    return res.status(500).json({
      message: "An error occurred while saving the purchase.",
      error: error.message,
    });
  }
};

// Controller to save expenses
const saveExpenses = async (req, res) => {
  try {
    const { date, voucherNo, expenses, grandTotal, comment } = req.body;

    // Create the expense record
    const newExpense = await ExpenseManager.create({
      date,
      voucherNo,
      expenses,
      grandTotal,
      comment,
    });

    return res.status(201).json({
      message: "Expense saved successfully.",
      data: newExpense,
    });
  } catch (error) {
    console.error("Error saving expense:", error);
    return res.status(500).json({
      message: "An error occurred while saving the expense.",
      error: error.message,
    });
  }
};

// Fetch Stock Voucher-Wise
const getStockVoucherWise = async (req, res) => {
  try {
    // Fetch all records from ItemManager
    const stockData = await ItemManager.findAll({
      attributes: [
        "id",
        "date",
        "voucherNo",
        "client",
        "items",
        "grandTotal",
        "paymentStatus",
      ],
      order: [["date", "DESC"]],
    });

    // Prepare the response data
    const stockList = stockData.map((record) => {
      return {
        id: record.id,
        date: record.date,
        voucherNo: record.voucherNo,
        client: record.client,
        items: record.items, // JSON array of items (itemName, quantity, rate)
        grandTotal: record.grandTotal,
        paymentStatus: record.paymentStatus,
      };
    });

    res.status(200).json({ success: true, data: stockList });
  } catch (error) {
    console.error("Error fetching stock voucher-wise:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch stock data." });
  }
};

// Controller to fetch all stock out details, including the bill date and discount
const getAllStockOut = async (req, res) => {
  try {
    // Fetch all bills with relevant fields
    const bills = await Bill.findAll({
      attributes: [
        "id",
        "bill_no",
        "patientId",
        "consultation",
        "test",
        "pharmacy",
        "totalAmount",
        "paymentMode",
        "discount",
        "netAmount",
        "createdAt",
      ],
    });

    const stockOutData = [];

    // Iterate over each bill and extract consultation, test, and pharmacy data
    bills.forEach((bill) => {
      const { bill_no, test, pharmacy, consultation, discount, createdAt } =
        bill;
      const billDate = createdAt.toISOString().split("T")[0]; // Format date as YYYY-MM-DD

      // Calculate the discount percentage
      const discountPercentage = discount
        ? (discount / bill.totalAmount) * 100
        : 0;

      // Process consultation items
      if (Array.isArray(consultation)) {
        consultation.forEach((item) => {
          const discountedPrice =
            item.price - (item.price * discountPercentage) / 100;
          stockOutData.push({
            bill_no,
            date: billDate,
            type: "Consultation",
            name: item.service || "N/A",
            price: discountedPrice.toFixed(2),
          });
        });
      }

      // Process test items
      if (Array.isArray(test)) {
        test.forEach((item) => {
          const discountedPrice =
            item.testPrice - (item.testPrice * discountPercentage) / 100;
          stockOutData.push({
            bill_no,
            date: billDate,
            type: "Test",
            name: item.testName || "N/A",
            price: discountedPrice.toFixed(2),
          });
        });
      }

      // Process pharmacy items
      if (Array.isArray(pharmacy)) {
        pharmacy.forEach((item) => {
          const total = (item.price || 0) * (item.quantity || 1);
          const discountedTotal = total - (total * discountPercentage) / 100;
          stockOutData.push({
            bill_no,
            date: billDate,
            type: "Pharmacy",
            name: item.medicine || "N/A",
            price: item.price || 0,
            quantity: item.quantity || 0,
            total: discountedTotal.toFixed(2),
          });
        });
      }
    });

    // Send the aggregated stock out data as the response
    res.status(200).json({
      success: true,
      data: stockOutData,
    });
  } catch (error) {
    console.error("Error fetching stock out data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching stock out data.",
    });
  }
};

const savePurchaseClient = async (req, res) => {
  console.log("Form Data:", req.body);
  try {
    const { query, code, ...updateFields } = req.body; // Destructure to separate `query` and `code`

    if (query === "1") {
      // Update record if query is 1
      const [updated] = await PurchaseClient.update(
        updateFields, // Use the rest of the fields for updating
        { where: { code } }
      );

      if (updated) {
        res.status(200).json({ message: "Client data updated successfully!" });
      } else {
        res.status(404).json({ message: "Client not found for update." });
      }
    } else {
      const existingTest = await PurchaseClient.findOne({ where: { code } });
      if (existingTest) {
        return res
          .status(409)
          .json({ message: "A Client with this code already exists." });
      }

      await PurchaseClient.create(req.body);
      res.status(200).json({ message: "Client data saved successfully!" });
    }
  } catch (error) {
    console.error("Error saving data:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
};

// Controller to update purchase items
const updatePurchaseItem = async (req, res) => {
  try {
    const {
      voucherNo,
      date,
      client,
      items,
      grandTotal,
      paymentStatus,
      comment,
      id,
    } = req.body;

    // Log the request body for debugging
    console.log("Update Request Data:", req.body);

    // Validate the input data
    if (!voucherNo || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input data. Please provide valid voucherNo and items array.",
      });
    }

    // Find the existing purchase record by voucherNo
    const existingPurchase = await ItemManager.findOne({ where: { id } });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found. Unable to update.",
      });
    }

    // Update the purchase details with the provided data
    existingPurchase.date = date;
    existingPurchase.client = client;
    existingPurchase.items = items;
    existingPurchase.grandTotal = grandTotal; // Use the grandTotal from the frontend
    existingPurchase.paymentStatus = paymentStatus;
    existingPurchase.comment = comment;

    // Save the updated record
    await existingPurchase.save();

    return res.status(200).json({
      success: true,
      message: "Purchase details updated successfully.",
      data: existingPurchase,
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the purchase.",
      error: error.message,
    });
  }
};

// Controller to fetch purchase details by voucherNo
const getPurchaseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the purchase record by voucherNo
    const purchaseDetails = await ItemManager.findOne({
      where: { id },
      attributes: [
        "id",
        "date",
        "voucherNo",
        "client",
        "items",
        "grandTotal",
        "paymentStatus",
        "comment",
        "createdAt",
        "updatedAt",
      ],
    });

    // If purchase record not found, return 404
    if (!purchaseDetails) {
      return res.status(404).json({
        success: false,
        message: `No purchase details found for voucherNo: ${voucherNo}`,
      });
    }

    // Respond with the purchase details
    return res.status(200).json({
      success: true,
      data: purchaseDetails,
    });
  } catch (error) {
    console.error("Error fetching purchase details:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching purchase details.",
      error: error.message,
    });
  }
};

const updateStaffStatus = async (req, res) => {
  try {
    const {
      id,
      ConSMS,
      ConEmail,
      SchSMS,
      SchEmail,
      OnAppointmentSMS,
      pushNotify,
    } = req.body;

    // console.log(
    //   id,
    //   ConSMS,
    //   ConEmail,
    //   SchSMS,
    //   SchEmail,
    //   OnAppointmentSMS,
    //   pushNotify
    // );

    const staff = await doctor_staff_Status.findByPk(id);
    const body = {
      ["ConSMS"]: ConSMS === undefined ? staff.ConSMS : ConSMS,
      ["ConEmail"]: ConEmail === undefined ? staff.ConEmail : ConEmail,
      ["SchSMS"]: SchSMS === undefined ? staff.SchSMS : SchSMS,
      ["SchEmail"]: SchEmail === undefined ? staff.SchEmail : SchEmail,
      ["OnAppointmentSMS"]:
        OnAppointmentSMS === undefined
          ? staff.OnAppointmentSMS
          : OnAppointmentSMS,
      ["pushNotify"]: pushNotify === undefined ? staff.pushNotify : pushNotify,
    };

    console.log(body);

    // await staff.save();
    const val = await doctor_staff_Status.update(body, {
      where: {
        id: id,
      },
    });
    console.log(val);

    doctorNotify(staff.doctorStaffId, staff.staffType);

    // Send success response
    // res.status(200).json({ msg: "Staff status updated successfully" });
    res.status(200).json({ msg: "Staff status updated successfully" });
  } catch (error) {
    console.error("Error updating staff status:", error);
    res.status(500).json({ msg: "Error during status update" });
  }
};

const doctorNotify = async (id, staffTp) => {
  try {
    const staff = await doctor_staff_Status.findOne({
      where: {
        doctorStaffId: id,
        staffType: staffTp,
      },
    });

    if (!staff) {
      console.log("Staff not found for notification");
      return { responseMsg: "Staff not found for notification" };
    }

    if (staffTp === "staff") {
      const staffs = await Staff.findByPk(staff.doctorStaffId);
    } else if (staffTp === "doc") {
      const doctor = await Doctors.findByPk(staff.doctorStaffId);
    }

    const notification = await NotificationTable.findOne({
      where: {
        staffId: staff.id,
      },
    });

    // If no record is found, return null
    if (!notification) {
      console.log("No notification found for this staffId.");
      return null;
    }
    const responseMsg = {};

    // Get the current date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Get the date from the notification (YYYY-MM-DD)
    const notificationDate = new Date(notification.date)
      .toISOString()
      .split("T")[0];

    // Check if the notification date is today's date
    let notifications = notification;
    if (today !== notificationDate) {
      console.log(today, notificationDate);

      await NotificationTable.update(
        {
          ["ConSMS"]: false,
          ["ConEmail"]: false,
          ["SchSMS"]: false,
          ["SchEmail"]: false,
          ["OnAppointmentSMS"]: false,
          ["pushNotify"]: false,
          date: today,
        },
        {
          where: {
            id: notification.id,
          },
        }
      );
      notifications = {
        ...notification,
        ["ConSMS"]: false,
        ["ConEmail"]: false,
        ["SchSMS"]: false,
        ["SchEmail"]: false,
        ["OnAppointmentSMS"]: false,
        ["pushNotify"]: false,
      };
    }

    // Confirmation SMS
    responseMsg["ConSMS"] = staff.ConSMS || notifications.ConSMS;
    responseMsg["SchSMS"] = staff.SchSMS || notifications.SchSMS;
    responseMsg["ConEmail"] = staff.ConEmail || notifications.ConEmail;
    responseMsg["SchEmail"] = staff.SchEmail || notifications.SchEmail;
    responseMsg["OnAppointmentSMS"] =
      staff.OnAppointmentSMS || notifications.OnAppointmentSMS;
    responseMsg["pushNotify"] = staff.pushNotify || notifications.pushNotify;
    if (!notifications.ConSMS && staff.ConSMS) {
      console.log("Confirmation SMS sent");
    }

    // Schedule SMS
    if (!notifications.SchSMS && staff.SchSMS) {
      console.log("Schedule SMS sent");
    }

    // Schedule SMS
    if (!notifications.ConEmail && staff.ConEmail) {
      console.log("Confirmation Email sent");
    }

    // Confirmation Email
    if (!notifications.SchEmail && staff.SchEmail) {
      console.log("Schedule Email sent");
    }

    // Appointment SMS
    if (!notifications.OnAppointmentSMS && staff.OnAppointmentSMS) {
      console.log("On-Appointment SMS sent");
    }

    // Push Notification
    if (!notification.pushNotify && staff.pushNotify) {
      console.log("Push notification sent");
    }
    await NotificationTable.update(responseMsg, {
      where: {
        id: notification.id,
      },
    });
    return responseMsg;
  } catch (error) {
    console.error("Error sending notification to staff:", error);
  }
};

const updateUserAppointmentStatus = async (req, res) => {
  try {
    const {
      id,
      appntSMS,
      appntMail,
      reprtWatsp,
      rprtMail,
      prscrpWatsp,
      prscrpMail,
      billMail,
      billWatsp,
    } = req.body;

    // Fetch the existing record by primary key (id)
    const appointment = await UserAppointment.findByPk(id);

    // If the record does not exist, return an error response
    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    // Construct the update body with conditional checks
    const updateBody = {
      appntSMS: appntSMS === undefined ? appointment.appntSMS : appntSMS,
      appntMail: appntMail === undefined ? appointment.appntMail : appntMail,
      reprtWatsp:
        reprtWatsp === undefined ? appointment.reprtWatsp : reprtWatsp,
      rprtMail: rprtMail === undefined ? appointment.rprtMail : rprtMail,
      prscrpWatsp:
        prscrpWatsp === undefined ? appointment.prscrpWatsp : prscrpWatsp,
      prscrpMail:
        prscrpMail === undefined ? appointment.prscrpMail : prscrpMail,
      billMail: billMail === undefined ? appointment.billMail : billMail,
      billWatsp: billWatsp === undefined ? appointment.billWatsp : billWatsp,
    };

    // Log the update body for debugging
    console.log("Update Body:", updateBody);

    // Perform the update operation
    const updateResult = await UserAppointment.update(updateBody, {
      where: {},
    });

    // Check if the update was successful
    if (updateResult[0] === 0) {
      return res
        .status(400)
        .json({ msg: "Failed to update appointment status" });
    }

    // Log the update result for debugging
    console.log("Update Result:", updateResult);
    // userNotify(id);

    // Optionally, you can call a notification function here if needed
    // notifyUser(appointment.id);

    // Send a success response
    res
      .status(200)
      .json({ msg: "User appointment status updated successfully" });
  } catch (error) {
    console.error("Error updating user appointment status:", error);
    res.status(500).json({ msg: "Error during status update" });
  }
};

const userNotify = async (userId) => {
  try {
    const user = await UserAppointment.findByPk(userId);
    // Fetch user notification settings
    const userNotification = await UserNotification.findOne({
      where: {
        userId: userId,
      },
    });

    if (!userNotification) {
      console.log("No notification found for this userId.");
      return { responseMsg: "User notification not found" };
    }

    const responseMsg = {};

    // Get the current date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    const notificationDate = new Date(userNotification.date)
      .toISOString()
      .split("T")[0];

    // Reset notification fields if the date is not today's date
    let notifications = userNotification;
    if (today !== notificationDate) {
      await UserNotification.update(
        {
          appntSMS: false,
          appntMail: false,
          reprtWatsp: false,
          rprtMail: false,
          prscrpWatsp: false,
          prscrpMail: false,
          billMail: false,
          billWatsp: false,
          date: today,
        },
        {
          where: { id: userNotification.id },
        }
      );
      notifications = {
        ...userNotification,
        appntSMS: false,
        appntMail: false,
        reprtWatsp: false,
        rprtMail: false,
        prscrpWatsp: false,
        prscrpMail: false,
        billMail: false,
        billWatsp: false,
      };
    }

    // Notification checks and sending logic
    if (!notifications.appntSMS && user.appntSMS) {
      console.log("Appointment SMS sent");
      responseMsg["appntSMS"] = true;
    }

    if (!notifications.appntMail && user.appntMail) {
      console.log("Appointment Email sent");
      responseMsg["appntMail"] = true;
    }

    if (!notifications.reprtWatsp && user.reprtWatsp) {
      console.log("Report WhatsApp notification sent");
      responseMsg["reprtWatsp"] = true;
    }

    if (!notifications.rprtMail && user.rprtMail) {
      console.log("Report Email sent");
      responseMsg["rprtMail"] = true;
    }

    if (!notifications.prscrpWatsp && user.prscrpWatsp) {
      console.log("Prescription WhatsApp notification sent");
      responseMsg["prscrpWatsp"] = true;
    }

    if (!notifications.prscrpMail && user.prscrpMail) {
      console.log("Prescription Email sent");
      responseMsg["prscrpMail"] = true;
    }

    if (!notifications.billMail && user.billMail) {
      console.log("Bill Email sent");
      responseMsg["billMail"] = true;
    }

    if (!notifications.billWatsp && user.billWatsp) {
      console.log("Bill WhatsApp notification sent");
      responseMsg["billWatsp"] = true;
    }

    // Update the user notification record with the new statuses
    await UserNotification.update(responseMsg, {
      where: {
        id: userNotification.id,
      },
    });

    return responseMsg;
  } catch (error) {
    console.error("Error sending notification to user:", error);
    return { responseMsg: "Error during user notification" };
  }
};

const saveTemplate = async (req, res) => {
  try {
    const {
      confSmsTemp,
      canSmsTemp,
      confEmailTemp,
      canEmailTemp,
      phone,
      email,
      apntDayTime,
      apntDayPrev,
      folEmailTemp,
    } = req.body;

    if (
      !confSmsTemp ||
      !canSmsTemp ||
      !confEmailTemp ||
      !canEmailTemp ||
      !phone ||
      !email ||
      !apntDayTime ||
      !apntDayPrev ||
      !folEmailTemp
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    console.log("User: ", req.user);

    const clinicId = 0;
    const body = {
      clinicId,
      confSmsTemp,
      canSmsTemp,
      confEmailTemp,
      canEmailTemp,
      phone,
      email,
      apntDayTime,
      apntDayPrev,
      folEmailTemp,
    };
    console.log(body);

    const template = await SMSTemplate.create(body);
    res.json({ msg: "Template saved successfully", template });
  } catch (err) {
    console.error("Error saving template:", err);
    return res.status(500).json({ msg: "Error during template save" });
  }
};

const getDoctorTimeTable = async (req, res) => {
  try {
    const doctorId = req.query.id;
    if (!doctorId) {
      return res.status(400).json({ msg: "Doctor ID is required" });
    }
    const decodeDId = decryptData(decodeURIComponent(doctorId), "llppc");
    console.log("id: ", doctorId);

    const timeTable = await DoctorTimeTable.findAll({
      where: {
        doctorId: decodeDId || doctorId,
      },
    });
    if (!timeTable) {
      return res.status(404).json({ msg: "Doctor's timetable not found" });
    }
    const appointment = await Appointment.findAll({
      where: {
        doctorId: decodeDId || doctorId,
      },
    });
    let timeTableArray = [];
    let dayArray = timeTable;
    timeTable.forEach((timeSlot) => {
      const { timeTable } = timeSlot.dataValues;
      timeTable.forEach((slot) => {
        timeTableArray.push(slot);
      });
    });
    return res.status(200).json({
      timeTableArray,
      dayArray,
      appointment,
    });
  } catch (err) {
    console.error("Error fetching doctor timetable:", err);
    return res.status(500).json({ msg: "Error during timetable fetch" });
  }
};

const getCodeFormat = async (req, res) => {
  try {
    const { series } = req.query;
    const count = await CodeFormat.count({
      where: {
        series: series, // Ensure the key matches the column in your database
      },
    });

    // if (!count) {
    //   return res.status(404).json({ msg: "Code format not found" });
    // }
    console.log("Total count: ", count);

    return res.status(200).json(count);
  } catch (err) {
    console.error("Error fetching code format:", err);
    return res.status(500).json({ msg: "Error during code format fetch" });
  }
};

const getDoctorNotification = async (req, res) => {
  try {
    const notification = await NotificationTable.findAll({
      where: {
        pushNotify: true,
      },
      attributes: ["staffId", "date"],
    });
    console.log("Notification: ", notification);

    if (!notification.length) {
      return res.status(404).json({ msg: "Doctor's notification not found" });
    }
    const staffIdArray = notification.map((item) => item.staffId);
    const doctorIds = await doctor_staff_Status.findAll({
      where: {
        id: {
          [Op.in]: staffIdArray,
        },
      },
    });
    const doctorIdArray = doctorIds.map((item) => item.doctorStaffId);
    if (!doctorIdArray.length) {
      return res.status(404).json({ msg: "Doctor's notification not found" });
    }
    const doctors = await Doctors.findAll({
      where: {
        id: {
          [Op.in]: doctorIdArray,
        },
      },
    });
    return res.status(200).json(doctors);
  } catch (err) {
    console.error("Error fetching doctor notification:", err);
    return res.status(500).json({ msg: "Error during notification fetch" });
  }
};

const setDeseaseTable = async (req, res) => {
  try {
    const { disease, symptoms, tests, medicine, id } = req.body;
    if (id) {
      const decease = await DeseaseTable.findByPk(id);
      if (!decease) {
        return res.status(404).json({ msg: "Desease not found" });
      }
      decease.name = disease;
      await decease.save();

      if (tests !== undefined && tests.length) {
        await TestsTable.destroy({
          where: {
            disId: decease.id,
          },
        });
        const testArray = [];
        tests.forEach((t) => {
          testArray.push({
            disId: decease.id,
            name: t,
          });
        });
        await TestsTable.bulkCreate(testArray);
      }
      if (symptoms && symptoms.length) {
        await EmrComplaints.update(
          { complaints: symptoms },
          {
            where: {
              disId: decease.id,
            },
          }
        );
      }
      if (medicine && medicine.length) {
        await MedicineTable.destroy({
          where: {
            disId: decease.id,
          },
        });
        const medicineArray = [];
        medicine.forEach((m) => {
          medicineArray.push({
            disId: decease.id,
            name: m,
          });
        });
        await MedicineTable.bulkCreate(medicineArray);
      }

      return res.status(200).json({ msg: "Desease updated successfully" });
    }
    const deceases = await DeseaseTable.findAll({
      where: {
        name: {
          [Op.like]: `%${disease}%`,
        },
      },
    });
    if (deceases.length) {
      return res.status(401).json({ msg: "Desease already exist" });
    }
    console.log("Clinic Id:", req.session.clinicId);

    const newDesease = await DeseaseTable.create({
      name: disease,
      clinicId: req.session.clinicId,
    });

    let newTests = null;
    let newMedicine = null;
    let newSymptoms = await EmrComplaints.create({
      disId: newDesease.id,
      complaints: symptoms,
    });
    if (tests.length > 0) {
      const testArray = [];
      tests.forEach((t) => {
        testArray.push({
          disId: newDesease.id,
          name: t,
        });
      });
      newTests = await TestsTable.bulkCreate(testArray);
    }
    if (medicine.length) {
      const medicineArray = [];
      medicine.forEach((m) => {
        medicineArray.push({
          disId: newDesease.id,
          name: m,
        });
      });
      newMedicine = await MedicineTable.bulkCreate(medicineArray);
    }

    return res.status(200).json({
      message: "Desease appended successfully",
      newDesease,
      newSymptoms,
      newTests,
      newMedicine,
    });
  } catch (err) {
    console.error("Error setting desease table:", err);
    return res.status(500).json({ msg: "Error during desease table save" });
  }
};

const getDisease = async (req, res) => {
  try {
    const dis = req.query.name;
    if (dis === undefined) {
      const disease = await DeseaseTable.findAll();
      return res.status(200).json(disease);
    }
    const disease = await DeseaseTable.findAll({
      where: {
        name: {
          [Op.like]: `%${dis}%`,
        },
      },
    });
    if (disease.length) {
      return res.status(400).json({
        message: "disease already exists",
      });
    }
    return res.status(200).json({ message: true });
  } catch (err) {
    console.error("Error fetching diseases:", err);
    return res.status(500).json({ msg: "Error during diseases fetch" });
  }
};

const getAllpointsDisease = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Please provide clinic id." });
  }
  const disease = await DeseaseTable.findByPk(id);
  const tests = await TestsTable.findAll({
    where: {
      disId: id,
    },
  });
  const medicines = await MedicineTable.findAll({
    where: {
      disId: id,
    },
  });
  const complaints = await EmrComplaints.findAll({
    where: {
      disId: id,
    },
  });
  return res.status(200).json({
    disease,
    tests,
    medicines,
    complaints,
  });
};

const getAllAppointments = async (req, res) => {
  try {
    const { id } = req.query;
    let whereC = null;
    let appointments = null;
    const today = new Date().toISOString().split("T")[0];
    if (id) {
      let dId = decryptData(decodeURIComponent(id), "llppc");
      whereC = {
        patientId: dId,
        date: {
          [Op.gte]: today, // Ensure we're checking for today (date only)
          [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split("T")[0], // Ensure it's before tomorrow
        },
      };
      appointments = await Appointment.findOne({
        where: whereC,
      });
    } else {
      whereC = {
        date: {
          [Op.gte]: today, // Ensure we're checking for today (date only)
          [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split("T")[0], // Ensure it's before tomorrow
        },
      };
      appointments = await Appointment.findAll({
        where: whereC,
      });
    }
    // const allAppointments = await Appointment.findAll();

    return res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({ msg: "Error during appointments fetch" });
  }
};

const cancelAppointment = async (req, res) => {
  const { id } = req.query;
  const decodeDId = decryptData(decodeURIComponent(id), "llppc");
  if (!id) {
    return res.status(400).json({ message: "Please provide appointment id." });
  }
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(
      "TOday: ",
      today,
      " : ",
      new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0]
    );

    const appointment = await Appointment.findOne({
      where: {
        patientId: decodeDId,
        date: {
          [Op.gte]: today, // Ensure we're checking for today (date only)
          [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split("T")[0], // Ensure it's before tomorrow
        },
      },
    });
    const visit = await Visit.findOne({
      where: {
        patientId: decodeDId,
        date: {
          [Op.gte]: today, // Ensure we're checking for today (date only)
          [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1))
            .toISOString()
            .split("T")[0], // Ensure it's before tomorrow
        },
      },
    });

    if (!appointment || !visit) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await appointment.destroy();
    await visit.destroy();
    await sendEmailTemplate(decodeDId, "cancel", req);
    return res
      .status(200)
      .json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    return res
      .status(500)
      .json({ msg: "Error during appointment cancellation" });
  }
};

const XLSX = require("xlsx");

const uploadExcelItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Read the uploaded Excel file
    const filePath = path.join(
      __dirname,
      "../public/MyUploads",
      req.file.filename
    );
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validate and map the data to match the Items schema
    const validData = jsonData.map((row) => ({
      code: row["code"] || null,
      name: row["name"] || null,
      molecule: row["molecule"] || null,
      sellingPrice: row["sellingPrice"] || null,
      category: row["category"] || null,
      clinicid: req.session.clinicId,
    }));

    // Insert data into the database
    const insertedData = await Items.bulkCreate(validData, { validate: true });
    console.log(insertedData);

    // Respond with success
    res.status(200).json({
      message: "File processed successfully",
      insertedCount: insertedData.length,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};

const sendMail = async (sender, recipient, subject, text, html) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use any email service (e.g., Gmail, Outlook)
      auth: {
        user: "wtf.lakshya145@gmail.com", // Set your email user in environment variables
        pass: "vwaxirfazdyewvkq", // Set your email password in environment variables
      },
    });

    // Define the email options
    const mailOptions = {
      from: sender,
      to: recipient,
      subject,
      text,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

const sendEmailTemplate = async (id, type, req) => {
  try {
    if (!id) {
      return res.status(400).json({ message: "Please provide patient id." });
    }
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }
    const template = await SMSTemplate.findOne({
      where: {
        clinicid: req.session.clinicId,
      },
    });
    if (!template) {
      console.log("No template found");
    }
    let temp = "";
    let from = "wtf.lakshya145@gmail.com";
    if (type === "cancel") temp = template.canEmailTemp;
    else temp = template.confEmailTemp;
    if (type === "cancel") {
      await sendMail(
        from,
        // patient.email,
        "ayushdnfd1679@gmail.com",
        "Appointment Cancel",
        "Email for notiifying for cancelation of appointment",
        temp
      );
    } else {
      await sendMail(
        from,
        "ayushdnfd1679@gmail.com",
        "Appointment Confirmation",
        "Email for notiifying for appointment confirmation",
        temp
      );
    }
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Error sending email template: ", err);
  }
};

const downloadData = async (req, res) => {
  const filePath = path.join(__dirname, "../public/MyUploads", "MOCK_DATA.csv");

  // Check if the file exists
  res.download(filePath, "example.csv", (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error downloading the file");
    } else {
      console.log("File sent successfully");
    }
  });
};

// Export all the controller functions
module.exports = {
  saveClinic,
  saveDoctor,
  saveSpeciality,
  saveSymptoms,
  saveTest,
  saveService,
  saveItem,
  saveExpense,
  savePatient,
  getSpeciality,
  getClinics,
  getSymptoms,
  getTests,
  getServices,
  getItems,
  getDoctors,
  getPatients,
  getExpenses,
  saveStaff,
  getStaff,
  saveEmrComplaints,
  saveEmrExamination,
  saveEmrHistory,
  saveEmrPrescriptions,
  saveEmrRecommendedTests,
  getConsultation,
  getLatestRecommendedTests,
  getLatestPrescription,
  saveBill,
  getBills,
  getPatientBills,
  saveVisit,
  getPatientAppointments,
  saveAppointment,
  search,
  getPatientById,
  getTodaysAppointments,
  getVisits,
  getPatientVisits,
  getStaffStatus,
  updateStaffStatus,
  getItemsAndTests,
  savePurchaseItem,
  saveExpenses,
  getStockVoucherWise,
  getAllStockOut,
  savePurchaseClient,
  getPurchaseClient,
  updatePurchaseItem,
  getPurchaseDetails,
  updateUserAppointmentStatus,
  saveTemplate,
  getDoctorTimeTable,
  getCodeFormat,
  getDoctorNotification,
  setDeseaseTable,
  getDisease,
  getAllpointsDisease,
  getAllAppointments,
  cancelAppointment,
  uploadExcelItem,
  downloadData,
};
