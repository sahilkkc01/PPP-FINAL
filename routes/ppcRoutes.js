var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { Op, Sequelize } = require("sequelize");
const decodeUserToken = (token) => {
  try {
    // Decode and verify the JWT token
    const decodedUser = jwt.verify(token, "llppc");
    return decodedUser; // Contains user details like id, userId, username, and email
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
const {
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

  getPatientAppointments,
  saveVisit,
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
  getPurchaseDetails,
  updatePurchaseItem,
  updateUserAppointmentStatus,
  saveTemplate,
  getCodeFormat,
  getDoctorTimeTable,
  getDoctorNotification,
  getDisease,
  setDeseaseTable,
  getAllpointsDisease,
  getAllAppointments,
  uploadExcelItem,
} = require("../controllers/ppcControllers");
const {
  my_Notes: Note,
  Speciality,
  Clinic,
  Doctors,
  Expenses,
  Services,
  Symptoms,
  Tests,
  Items,
  Patient,
  Staff,
  EmrComplaints,
  EmrExamination,
  EmrHistory,
  EmrPrescription,
  EmrRecommendedTests,
  Bill,
  UserTokens,
  Visit,
  PurchaseClient,
  Appointment,
} = require("../models/ppcModels");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/MyUploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
  },
});
const crypto = require("crypto");

const sjcl = require("sjcl");

// Encryption function
function encryptDataForUrl(data) {
  // Encrypt data with the secret key
  const encrypted = sjcl.encrypt("ll", data);

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

const upload = multer({ storage: storage });

const { login, logout } = require("../controllers/auth");
const { authMiddleware } = require("../middleware/auth");

router.get("/", (req, res) => {
  res.redirect("/1");
});

router.get("/1", async (req, res) => {
  const token = req.cookies.token; // Retrieve the JWT token from cookies

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserTokens.findOne({ where: { jwtToken: token } });
      console.log("hi");
      console.log(user);

      if (user) {
        req.user = decoded; // Attach user details to req.user
        res.locals.user = req.user; // Make user available in templates
        return res.redirect(200,"/patients", {
          name: decoded.username,
        });
      } else {
        console.log("in");
        return res.render("login");
      }
      // If the token is valid, redirect to home
    } catch (err) {
      console.error("Invalid token", err);
      // If token verification fails, continue to render login
    }
  }

  // If no valid token is found, render the login page
  res.render("login");
});

router.get("/qr-registration", async (req, res) => {
  try {
    const { cid } = req.query; // Get clinic ID from query
    res.locals.username = "Doctor";

    if (!cid) {
      console.warn("Missing clinic ID in query.");
      return res.status(400).send("Clinic ID is required."); // Respond with an error for missing cid
    }

    // Pass data to the template (e.g., clinicId)
    res.render("PPC/qr_registration", { data: {} });
  } catch (error) {
    console.error("Error in /qr-registration route:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/qrpatient",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ]),
  savePatient
);

router.post(
  "/qrpatient",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ]),
  savePatient
);

router.use(authMiddleware);

router.post("/login", login);
router.post("/logout", logout);

// Route for Add Clinic
router.get("/add-clinic", async (req, res) => {
  const { id } = req.query;
  console.log(id);

  if (id) {
    const decryptedId = decryptData(decodeURIComponent(id), "llppc");
    try {
      const data = await Clinic.findByPk(decryptedId);
      const values = data ? data.get({ plain: true }) : {};
      res.render("PPC/add-clinic", { data: values });
    } catch (error) {
      console.error("Error fetching clinic data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-clinic", { data: {} });
  }
});

// Route for Add Doctor
router.get("/add-doctor", async (req, res) => {
  const { id } = req.query;
  console.log(id);

  if (id) {
    const decryptedId = decryptData(decodeURIComponent(id), "llppc");
    try {
      const data = await Doctors.findByPk(decryptedId);
      const values = data ? data.get({ plain: true }) : {};
      res.render("PPC/add-doctor", { data: values });
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-doctor", { data: {} });
  }
});

// Route for Add Expense Master
router.get("/add-expense-master", async (req, res) => {
  const { id } = req.query;
  console.log(id);

  if (id) {
    const decryptedId = decryptData(decodeURIComponent(id), "llppc");
    try {
      const data = await Expenses.findByPk(decryptedId);
      const values = data ? data.get({ plain: true }) : {};
      res.render("PPC/add-expense-master", { data: values });
    } catch (error) {
      console.error("Error fetching expense master data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-expense-master", { data: {} });
  }
});

// Route for Add Speciality
router.get("/add-speciality", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");
  if (id) {
    try {
      const data = await Speciality.findByPk(decryptedId);
      const values = data.get({ plain: true });
      res.render("PPC/add-speciality", { data: values });
    } catch (error) {
      console.error("Error fetching  data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-speciality", { data: {} });
  }
});

// Route for Add Services
router.get("/add-services", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Services.findByPk(decryptedId); // Assuming you have a Service model
      const values = data.get({ plain: true });
      res.render("PPC/add-services", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-services", { data: {} });
  }
});

// Route for Add Symptoms
router.get("/add-symptoms", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Symptoms.findByPk(decryptedId); // Assuming you have a Symptom model
      const values = data.get({ plain: true });
      res.render("PPC/add-symptoms", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-symptoms", { data: {} });
  }
});

// Route for Add Tests
router.get("/add-tests", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Tests.findByPk(decryptedId); // Assuming you have a Test model
      const values = data.get({ plain: true });
      res.render("PPC/add-tests", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-tests", { data: {} });
  }
});

router.get("/add-staff", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Staff.findByPk(decryptedId); // Assuming you have a Test model
      const values = data.get({ plain: true });
      res.render("PPC/add-staff", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-staff", { data: {} });
  }
});

// Route for Item Master
router.get("/item-master", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Items.findByPk(decryptedId); // Assuming you have an Item model
      const values = data.get({ plain: true });
      res.render("PPC/item-master", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/item-master", { data: {} });
  }
});

router.get("/patient-emr", async (req, res) => {
  const userDetails = decodeUserToken(req.cookies.token);
  console.log(userDetails);
  const { id } = req.query;
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      // Fetch the patient data by primary key
      const patientData = await Patient.findByPk(decryptedId);

      // If no patient data found, send an empty response
      if (!patientData) {
        return res.render("PPC/patient-emr", {
          data: {},
          complaints: [],
          examination: {},
          history: [],
          prescriptions: [],
          tests: [],
          visitSaved: false,
          username: userDetails.username,
        });
      }

      // Get today's date in 'YYYY-MM-DD' format (ignores time)
      const today = new Date().toISOString().split("T")[0];

      // Fetch the visit entry for the patient for today (ignoring time in comparison)
      const visitEntry = await Visit.findOne({
        where: {
          patientId: decryptedId,
          date: {
            [Op.gte]: today, // Ensure we're checking for today (date only)
            [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1))
              .toISOString()
              .split("T")[0], // Ensure it's before tomorrow
          },
        },
      });

      // Determine if the visit is saved
      const visitSaved = !!visitEntry;

      // Fetch all complaints, prescriptions, tests, and all history entries, single entry for examination
      const emrComplaints = await EmrComplaints.findAll({
        where: { patientId: decryptedId },
        order: [["createdAt", "DESC"]],
      });
      const emrExamination = await EmrExamination.findOne({
        where: { patientId: decryptedId },
        order: [["createdAt", "DESC"]],
      });
      const emrHistory = await EmrHistory.findAll({
        where: { patientId: decryptedId },
        order: [["createdAt", "DESC"]],
      });
      const emrPrescriptions = await EmrPrescription.findAll({
        where: { patientId: decryptedId },
        order: [["createdAt", "DESC"]],
      });
      const emrRecommendedTests = await EmrRecommendedTests.findAll({
        where: { patientId: decryptedId },
        order: [["createdAt", "DESC"]],
      });

      // Convert patient data to a plain object
      const patientValues = patientData.get({ plain: true });

      // Map complaints to include createdAt and complaints data for each entry
      const complaints = emrComplaints.map((complaint) => ({
        createdAt: complaint.createdAt,
        complaints: complaint.complaints,
      }));
      console.log(complaints);

      // Map prescriptions to include createdAt, prescriptions data, and prescribedComment for each entry
      const prescriptions = emrPrescriptions.map((prescription) => ({
        createdAt: prescription.createdAt,
        prescriptions: prescription.prescriptions,
        prescribedComment: prescription.prescribedComment,
      }));

      // Map tests to include createdAt, tests data, and comment for each entry
      const tests = emrRecommendedTests.map((test) => ({
        createdAt: test.createdAt,
        tests: test.tests,
        comment: test.comment,
      }));

      // Map all history entries
      const history = emrHistory.map((entry) => ({
        createdAt: entry.createdAt,
        history: entry.history,
      }));

      // Fetch single entry for examination
      const examination = emrExamination
        ? emrExamination.get({ plain: true })
        : {};

      // Render the page with all patient data, including visit status
      res.render("PPC/patient-emr", {
        data: patientValues,
        complaints,
        examination,
        history,
        prescriptions,
        tests,
        visitSaved,
        username: userDetails.username,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/patient-emr", {
      data: {},
      complaints: [],
      examination: {},
      history: [],
      prescriptions: [],
      tests: [],
      visitSaved: false,
      username: userDetails.username,
    });
  }
});

// Route for Patient Registration
router.get("/patient-registration", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await Patient.findByPk(decryptedId); // Assuming you have a PatientRegistration model
      const values = data.get({ plain: true });
      res.render("PPC/patient-registration", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/patient-registration", { data: {} });
  }
});

router.get("/speciality", (req, res) => {
  res.render("PPC/speciality");
});
router.get("/clinics", (req, res) => {
  res.render("PPC/clinics");
});
router.get("/doctors", (req, res) => {
  res.render("PPC/doctors");
});
router.get("/symptoms", (req, res) => {
  res.render("PPC/symptoms");
});
router.get("/tests", (req, res) => {
  res.render("PPC/tests");
});
router.get("/services", (req, res) => {
  res.render("PPC/services");
});
router.get("/items", (req, res) => {
  res.render("PPC/items");
});
router.get("/expenses", (req, res) => {
  res.render("PPC/expenses");
});
router.get("/patients", (req, res) => {
  res.render("PPC/patients");
});
router.get("/staff", (req, res) => {
  res.render("PPC/staff");
});
router.get("/emr", (req, res) => {
  res.render("PPC/emr");
});
router.get("/bill", (req, res) => {
  res.render("PPC/bill");
});
router.get("/billList", (req, res) => {
  res.render("PPC/billList");
});

router.get("/patient360", (req, res) => {
  console.log(req.cookies);
  const decoded = jwt.verify(req.cookies.token, JWT_SECRET);
  console.log(decoded);
  const { id } = req.query;
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");
  console.log(decryptedId);
  res.render("PPC/patient-360", { id });
});
router.get("/sendReminder", (req, res) => {
  res.render("PPC/send-reminder");
});

router.get("/calender", (req, res) => {
  res.render("PPC/calender");
});

router.get("/notification-setting", (req, res) => {
  res.render("PPC/notifications-setting");
});
router.get("/masterForInbound", (req, res) => {
  res.render("PPC/master-for-inbound");
});
router.get("/purchaseManager", (req, res) => {
  res.render("PPC/purchase-manager");
});
router.get("/stockManager", (req, res) => {
  res.render("PPC/stock-manager");
});

router.get("/printBill", async (req, res) => {
  try {
    // Get billId from query parameters
    const { id } = req.query;
    const decryptedId = decryptData(decodeURIComponent(id), "llppc");
    // Fetch the bill data based on billId
    const bill = await Bill.findOne({
      where: { id: decryptedId },
    });

    // If no bill is found, return a 404 error
    if (!decryptedId) {
      return res.status(404).json({ error: "Bill not found." });
    }

    // Fetch the patient details using patientId from the bill
    const patient = await Patient.findOne({
      where: { id: bill.patientId },
      attributes: ["id", "name", "email", "gender", "mobile", "age"], // Specify the fields needed
    });

    // If no patient is found, return a 404 error
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    console.log(bill);
    console.log(patient);
    // Render the printBill page with the fetched bill and patient data
    res.render("PPC/printBill", { bill, patient });
  } catch (error) {
    console.error("Error fetching bill or patient data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


router.get("/printEmr", async (req, res) => {
  try {
    // Get visitId from query parameters
    const { id } = req.query;
    const decryptedId = decryptData(decodeURIComponent(id), "llppc"); // Decrypt and decode the visit ID
    console.log("Decrypted Visit ID:", decryptedId);

    // Fetch the visit details based on the decrypted ID
    const visit = await Visit.findOne({
      where: { id: decryptedId },
    });

    // If no visit is found, return a 404 error
    if (!visit) {
      return res.status(404).json({ error: "Visit not found." });
    }
    console.log("Visit Details:", visit);

    // Fetch the patient details using the patientId from the visit
    const patient = await Patient.findOne({
      where: { id: visit.patientId },
      attributes: ["id", "name", "email", "gender", "mobile", "age", "address"],
    });

    // If no patient is found, return a 404 error
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }
    console.log("Patient Details:", patient);

    // Fetch all the EMR complaints for the patient with the same visit date
    const emrComplaints = await EmrComplaints.findAll({
      where: {
        patientId: visit.patientId,
        createdAt: {
          [Op.between]: [
            new Date(visit.date).setHours(0, 0, 0, 0), // Start of the visit date
            new Date(visit.date).setHours(23, 59, 59, 999), // End of the visit date
          ],
        },
      },
    });

    console.log("EMR Complaints:", emrComplaints);

    // Parse the complaints data into objects
    const parsedComplaints = emrComplaints
      .map((complaint) => {
        try {
          return complaint.complaints;
        } catch (e) {
          console.error('Error parsing complaint:', e);
          return [];
        }
      })
      .flat(); // Flatten the array of complaints
    console.log("Parsed Complaints:", parsedComplaints);

    // Fetch all the EMR prescriptions for the patient with the same visit date
    const emrPrescriptions = await EmrPrescription.findAll({
      where: {
        patientId: visit.patientId,
        createdAt: {
          [Op.between]: [
            new Date(visit.date).setHours(0, 0, 0, 0),
            new Date(visit.date).setHours(23, 59, 59, 999),
          ],
        },
      },
    });

    console.log("EMR Prescriptions:", emrPrescriptions);

    // Parse the prescriptions data into objects
    const parsedPrescriptions = emrPrescriptions
      .map((prescription) => {
        try {
          return prescription.prescriptions;
        } catch (e) {
          console.error('Error parsing prescription:', e);
          return [];
        }
      })
      .flat(); // Flatten the array of prescriptions
    console.log("Parsed Prescriptions:", parsedPrescriptions);

    // Fetch the EMR history for the patient with the same visit date
    const emrHistory = await EmrHistory.findAll({
      where: {
        patientId: visit.patientId,
        createdAt: {
          [Op.between]: [
            new Date(visit.date).setHours(0, 0, 0, 0),
            new Date(visit.date).setHours(23, 59, 59, 999),
          ],
        },
      },
    });
    // Parse the EMR history results
const parsedEmrHistory = emrHistory.map((history) => ({
  id: history.dataValues.id,
  patientId: history.dataValues.patientId,
  details: history.dataValues.history,
  createdAt: new Date(history.dataValues.createdAt).toLocaleString(),
  updatedAt: new Date(history.dataValues.updatedAt).toLocaleString(),
}));

    console.log("EMR History:", parsedEmrHistory);

    // Fetch the EMR recommended tests for the patient with the same visit date
    const emrRecommendedTests = await EmrRecommendedTests.findAll({
      where: {
        patientId: visit.patientId,
        createdAt: {
          [Op.between]: [
            new Date(visit.date).setHours(0, 0, 0, 0),
            new Date(visit.date).setHours(23, 59, 59, 999),
          ],
        },
      },
    });

    console.log("EMR Recommended Tests:", emrRecommendedTests);

    // Parse the recommended tests data into objects
    const parsedRecommendedTests = emrRecommendedTests.map((test) => {
      try {
        const parsedTests = test.tests; // Parse the JSON string in 'tests'
        return {
          tests: parsedTests, // The parsed tests array
          comment: test.comment || "N/A", // Default to 'N/A' if no comment
          createdAt: new Date(test.createdAt).toLocaleString(), // Format createdAt
          updatedAt: new Date(test.updatedAt).toLocaleString(), // Format updatedAt
        };
      } catch (e) {
        console.error('Error parsing recommended test:', e);
        return [];
      }
    });
    console.log("Parsed Recommended Tests:", parsedRecommendedTests);

    // Fetch the next follow-up appointment (if any) after the current visit
    const nextFollowUp = await Appointment.findOne({
      where: {
        patientId: visit.patientId,
        date: { [Op.gt]: visit.date }, // Find the next appointment date greater than current visit date
      },
      order: [["date", "ASC"]], // Order by date to get the earliest follow-up
      attributes: ["date", "time"], // Include time of the next appointment
    });

    console.log("Next Follow-Up:", nextFollowUp);

    // If no next follow-up is found, set it to null or a default value
    const followUpDate = nextFollowUp
      ? `${new Date(nextFollowUp.date).toLocaleDateString()} at ${nextFollowUp.time}`
      : "N/A";
    console.log("Follow-Up Date:", followUpDate);

    // Render the printEmr page with all the fetched data
    res.render("PPC/printEmr", {
      visit,
      patient,
      parsedComplaints,
      parsedPrescriptions,
      parsedEmrHistory,
      parsedRecommendedTests,
      followUpDate,
      billDate: new Date().toLocaleDateString(), // Optional: current date for bill
    });
  } catch (error) {
    console.error("Error fetching visit or patient data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});




router.get("/purchaseClient", (req, res) => {
  res.render("PPC/purchaseClient");
});
router.get("/add-purchase-client", async (req, res) => {
  const { id } = req.query;
  console.log(id);
  const decryptedId = decryptData(decodeURIComponent(id), "llppc");

  if (id) {
    try {
      const data = await PurchaseClient.findByPk(decryptedId); // Assuming you have a Test model
      const values = data.get({ plain: true });
      res.render("PPC/add-purchaseClient", { data: values });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("PPC/add-purchaseClient", { data: {} });
  }
});

router.post("/saveClinic", upload.single("logo"), saveClinic);
router.post("/saveDoctor", upload.single("image"), saveDoctor);
router.post(
  "/savePatient",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ]),
  savePatient
);

router.post("/saveSpeciality", saveSpeciality);
router.post("/saveStaff", saveStaff);
router.post("/saveSymptoms", saveSymptoms);
router.post("/saveTest", saveTest);
router.post("/savePurchaseClient", savePurchaseClient);
router.post("/saveService", saveService);
router.post("/saveItem", saveItem);
router.post("/saveExpense", saveExpense);
router.post("/saveEmrCompaints", saveEmrComplaints);
router.post("/saveEmrExamination", saveEmrExamination);
router.post("/saveEmrHistory", saveEmrHistory);
router.post("/savePrescription", saveEmrPrescriptions);
router.post("/saveRecTest", saveEmrRecommendedTests);

router.get("/getSpeciality", getSpeciality);
router.get("/getClinics", getClinics);
router.get("/getSymptoms", getSymptoms);
router.get("/getTests", getTests);
router.get("/getPurchaseClients", getPurchaseClient);
router.get("/getServices", getServices);
router.get("/getItems", getItems);
router.get("/getItemsAndTests", getItemsAndTests);
router.get("/getDoctors", getDoctors);
router.get("/getPatients", getPatients);
router.get("/getPatientbyId", getPatientById);
router.get("/getExpenses", getExpenses);
router.get("/getStaff", getStaff);
router.get("/getConsultation", getConsultation);
router.get("/getTodaysAppointments", getTodaysAppointments);

router.get("/getRecommendedTests", getLatestRecommendedTests);
router.get("/getLatestPharmacyItems", getLatestPrescription);
router.post("/saveBill", saveBill);
router.get("/getBills", getBills);
router.get("/getPatientBills", getPatientBills);
router.get("/getPatientAppointments", getPatientAppointments);
router.get("/getPatientVisits", getPatientVisits);
router.post("/saveVisit", saveVisit);
router.post("/saveFollowUp", saveAppointment);

const JWT_SECRET = "llppc";

router.get("/notes", async (req, res) => {
  try {
    // console.log("Session give: ", req.user);
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const notes = await Note.findAll({
      where: { staffId: decodedToken.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single note
router.get("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new note
router.post("/notes", async (req, res) => {
  try {
    // console.log("logging user: ", req.user);
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, JWT_SECRET);

    const { title, description, x_coordinate, y_coordinate, color } = req.body;

    const note = await Note.create({
      title,
      description,
      x_coordinate,
      y_coordinate,
      color,
      staffId: decodedToken.id,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put("/notes/:id", async (req, res) => {
  try {
    const { title, description, x_coordinate, y_coordinate, color } = req.body;

    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await note.update({
      title,
      description,
      x_coordinate,
      y_coordinate,
      color,
    });

    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete("/notes/:id", async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await note.destroy();
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update notes positions (for when multiple notes are moved)
router.put("/notes/bulk-update", async (req, res) => {
  try {
    const { notes } = req.body;

    // Use transaction to ensure all updates succeed or none do
    await sequelize.transaction(async (t) => {
      for (const noteData of notes) {
        await Note.update(
          {
            x_coordinate: noteData.x_coordinate,
            y_coordinate: noteData.y_coordinate,
          },
          {
            where: { id: noteData.id },
            transaction: t,
          }
        );
      }
    });

    res.json({ message: "Notes updated successfully" });
  } catch (error) {
    console.error("Error bulk updating notes:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/findcolumns", search);

router.get("/dashboard", async (req, res) => {
  res.render("PPC/dashboard");
});
router.get("/getvisits", getVisits);
router.get("/getstaffstatus", getStaffStatus);
router.put("/updateStaffStatus", updateStaffStatus);
router.post("/savePurchaseItem", savePurchaseItem);
router.post("/saveExpenses", saveExpenses);
router.get("/getStockVoucherWise", getStockVoucherWise);
router.get("/getAllStockOut", getAllStockOut);

router.get("/getPurchaseDetails/:id", getPurchaseDetails);
router.put("/updatePurchase/:id", updatePurchaseItem);
router.put("/updateUserStatus", updateUserAppointmentStatus);

router.get("/notification-setting", (req, res) => {
  res.render("PPC/notifications-setting");
});
router.get("/notificationTemp", async (req, res) => {
  res.render("PPC/notification-template");
});

router.post("/saveTemplate", saveTemplate);
router.get("/timeTable", getDoctorTimeTable);

router.get("/payPerVisit", async (req, res) => {
  res.render("PPC/ppp_click");
});

router.get("/add-prifix", async (req, res) => {
  res.render("PPC/add-prifix");
});

router.get("/getCode", getCodeFormat);
router.get("/getDoctorNotify", getDoctorNotification);
router.get("/addDisease", async (req, res) => {
  const emrPrescriptions = await EmrPrescription.findAll({
    order: [["createdAt", "DESC"]],
  });

  const prescriptions = emrPrescriptions.map((prescription) => ({
    createdAt: prescription.createdAt,
    prescriptions: prescription.prescriptions,
    prescribedComment: prescription.prescribedComment,
  }));

  res.render("PPC/add-disease", { prescriptions });
});

router.get("/getDisease", getDisease);
router.post("/saveDisease", setDeseaseTable);
router.get("/diseaseSelect", getAllpointsDisease);

router.get("/listDisease", async (req, res) => {
  res.render("PPC/disease_list");
});

router.get("/getAllAppointments", getAllAppointments);
router.post("/uploadExcelData", upload.single("file"), uploadExcelItem);

module.exports = router;
