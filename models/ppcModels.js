const { DataTypes, STRING } = require("sequelize");
const { sequelize } = require("../db"); // Import your sequelize instance as configured

const Clinic = sequelize.define(
  "Clinic",
  {
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    contactNoPrimary: DataTypes.STRING,
    contactNoSecondary: DataTypes.STRING,
    email: DataTypes.STRING,
    openingDays: DataTypes.STRING,
    timing: DataTypes.TIME,
    logo: DataTypes.STRING,
    address: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "clinics",
    alter: true,
    timestamps: true,
  }
);
const Speciality = sequelize.define(
  "Speciality",
  {
    clinicid: DataTypes.INTEGER,
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "speciality",
    alter: true,
    timestamps: true,
  }
);
const Expenses = sequelize.define(
  "Expenses",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "expenses",
    alter: true,
    timestamps: true,
  }
);
const Symptoms = sequelize.define(
  "Symptoms",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "symptoms",
    alter: true,
    timestamps: true,
  }
);
const Tests = sequelize.define(
  "Tests",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    mrp: DataTypes.INTEGER,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "tests",
    alter: true,
    timestamps: true,
  }
);
const Services = sequelize.define(
  "Services",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    price: DataTypes.STRING,
    category: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "services",
    alter: true,
    timestamps: true,
  }
);
const Items = sequelize.define(
  "Items",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    molecule: DataTypes.STRING,
    sellingPrice: DataTypes.STRING,
    category: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "items",
    alter: true,
    timestamps: true,
  }
);
const Doctors = sequelize.define(
  "Doctors",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    qualification: DataTypes.STRING,
    speciality: DataTypes.STRING,
    image: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "doctors",
    alter: true,
    timestamps: true,
  }
);
const Patient = sequelize.define(
  "Patient",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    age: DataTypes.STRING,
    weight_Kg: DataTypes.STRING,
    height_Feet: DataTypes.STRING,
    gender: DataTypes.STRING,
    image: DataTypes.STRING,
    report: DataTypes.STRING,
    address: DataTypes.STRING,
    ConsultingDoctor: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "patient",
    alter: true,
    timestamps: true,
  }
);

// Patient.sync({ alter: true });
const Staff = sequelize.define(
  "Staff",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    userId: DataTypes.STRING,
    password: DataTypes.STRING,
    rights: DataTypes.STRING,

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "staff",
    alter: true,
    timestamps: true,
  }
);

// Staff.sync({ alter: true });

const EmrComplaints = sequelize.define(
  "EmrComplaints",
  {
    patientId: DataTypes.STRING,
    complaints: DataTypes.JSON,
    disId: DataTypes.INTEGER,
  },
  {
    tableName: "emrcomplaints",
    alter: true,
    timestamps: true,
  }
);

// EmrComplaints.sync({ alter: true });

const EmrPrescription = sequelize.define(
  "EmrPrescription",
  {
    patientId: DataTypes.STRING,
    prescriptions: DataTypes.JSON,
    prescribedComment: DataTypes.STRING,
  },
  {
    tableName: "emrprescription",
    alter: true,
    timestamps: true,
  }
);

const EmrExamination = sequelize.define(
  "EmrExamination",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
    },
    heightFeet: {
      type: DataTypes.FLOAT,
    },
    weightKg: {
      type: DataTypes.FLOAT,
    },
    temperature: {
      type: DataTypes.FLOAT,
    },
    pulse: {
      type: DataTypes.INTEGER,
    },
    bmi: {
      type: DataTypes.FLOAT,
    },
    bloodPressure: {
      type: DataTypes.STRING,
    },
    bloodGroup: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "emrexaminations", // Name of the table in the database
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);
const EmrHistory = sequelize.define(
  "EmrHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
    },
    history: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "emrhistory", // Name of the table in the database
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const EmrRecommendedTests = sequelize.define(
  "EmrRecommendedTests",
  {
    patientId: DataTypes.STRING,
    tests: DataTypes.JSON, // Stores an array of selected test objects
    comment: DataTypes.STRING, // Common comment for the tests
  },
  {
    tableName: "emrrecommendedtests",
    alter: true,
    timestamps: true,
  }
);
const Visit = sequelize.define(
  "Visit",
  {
    patientId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    time: DataTypes.TIME,
    weight: DataTypes.STRING,
    height: DataTypes.STRING,
    fever: DataTypes.STRING,
    bp: DataTypes.STRING,
    sugar: DataTypes.STRING,
    bmi: DataTypes.STRING,
    doctor: DataTypes.STRING,
  },
  {
    tableName: "visit",
    alter: true,
    timestamps: true,
  }
);

Visit.sync({ alter: true });

const Appointment = sequelize.define(
  "Appointment",
  {
    doctorId: DataTypes.INTEGER,
    patientId: DataTypes.INTEGER,
    date: DataTypes.DATE, // Stores an array of selected test objects
    time: DataTypes.TIME, // Common comment for the tests
  },
  {
    tableName: "appointment",
    alter: true,
    timestamps: true,
  }
);

// Appointment.sync({alter:true});
const Bill = sequelize.define(
  "Bill",
  {
    bill_no: {
      type: STRING,
    },
    patientId: {
      type: DataTypes.INTEGER,
    },
    consultation: {
      type: DataTypes.JSON,
    },
    test: {
      type: DataTypes.JSON,
    },
    pharmacy: {
      type: DataTypes.JSON,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    netAmount: {
      type: DataTypes.FLOAT,
    },
    paymentMode: {
      type: DataTypes.STRING,
    },
    paidAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    advancePayment: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: "bills",
    timestamps: true,
  }
);

// Bill.sync({ alter: true });

const UserTokens = sequelize.define(
  "usertokens",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clinicid: DataTypes.INTEGER,
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jwtToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true, // Optional, set if token expiry is used
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "usertokens",
  }
);
// sequelize.sync()

const my_Notes = sequelize.define("Note", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  x_coordinate: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  y_coordinate: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "#fff740", // Default yellow color
  },
  staffId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// const doctor_staff_Status = sequelize.define(
//   "doctor_staff_Status",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     doctorStaffId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     staffType: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     ConSMS: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//     ConEmail: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//     SchSMS: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//     SchEmail: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//     OnAppointmentSMS: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//   },
//   {
//     timestamps: false, // If you want to manage the timestamps manually
//     tableName: "doctorStaff_Status",
//   }
// );

// doctor_staff_Status.sync({ alter: true });

// my_Notes.sync({ alter: true });

// UserTokens.sync({ alter: true });

const ItemManager = sequelize.define(
  "ItemManager",
  {
    date: DataTypes.DATEONLY,
    voucherNo: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    client: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    comment: DataTypes.TEXT,
    items: DataTypes.JSON, // JSON object to store item details
    grandTotal: DataTypes.DECIMAL(10, 2), // Grand total amount
  },
  {
    tableName: "item_manager",
    alter: true,
    timestamps: true,
  }
);

const ExpenseManager = sequelize.define(
  "ExpenseManager",
  {
    date: DataTypes.DATEONLY,
    clinicid: DataTypes.INTEGER,
    voucherNo: DataTypes.STRING,
    expenses: DataTypes.JSON, // JSON object to store expense details
    comment: DataTypes.TEXT,
    grandTotal: DataTypes.DECIMAL(10, 2), // Grand total amount
  },
  {
    tableName: "expense_manager",
    alter: true,
    timestamps: true,
  }
);

const PurchaseClient = sequelize.define(
  "PurchaseClient",
  {
    code: DataTypes.STRING,
    clinicid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    supplyItem: DataTypes.STRING,
    drugLicNoOld: DataTypes.STRING,
    drugLicNoNew: DataTypes.STRING,
    nablLabNo: DataTypes.STRING,
    validity: DataTypes.DATE,
    gstNo: DataTypes.STRING,
    address: DataTypes.STRING,
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "purchaseclient",
    alter: true,
    timestamps: true,
  }
);
// PurchaseClient.sync({ alter: true });

const doctor_staff_Status = sequelize.define(
  "doctor_staff_Status",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicid: DataTypes.INTEGER,
    doctorStaffId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    staffType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ConSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ConEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    SchSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    SchEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    OnAppointmentSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pushNotify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "doctorstaff_status",
  }
);

const NotificationTable = sequelize.define(
  "notificationTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    staffId: {
      type: DataTypes.INTEGER,
    },
    ConSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ConEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    SchSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    SchEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    OnAppointmentSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pushNotify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "push_notifyTable",
  }
);

const UserAppointment = sequelize.define(
  "userAppointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicid: DataTypes.INTEGER,
    appntSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    appntMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reprtWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rprtMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prscrpWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prscrpMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    billMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    billWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "userappointment",
  }
);

const UserNotification = sequelize.define(
  "userNotification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicid: DataTypes.INTEGER,
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appntSMS: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    appntMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reprtWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rprtMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prscrpWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    prscrpMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    billMail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    billWatsp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "usernotification",
  }
);

const SMSTemplate = sequelize.define(
  "smsTemplate",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicId: {
      type: DataTypes.INTEGER,
    },
    confSmsTemp: {
      type: DataTypes.TEXT,
    },
    canSmsTemp: {
      type: DataTypes.TEXT,
    },
    confEmailTemp: {
      type: DataTypes.TEXT,
    },
    canEmailTemp: {
      type: DataTypes.TEXT,
    },
    folEmailTemp: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    apntDayTime: {
      type: DataTypes.TIME,
    },
    apntDayPrev: {
      type: DataTypes.TIME,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "smstemplate",
  }
);

const DoctorTimeTable = sequelize.define(
  "DoctorTimeTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dayType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slotTiming: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timeTable: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: true, // If you want to manage the timestamps manually
    tableName: "doctortimetables",
  }
);
DoctorTimeTable.sync();
const CodeFormat = sequelize.define(
  "CodeFormat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicid: DataTypes.INTEGER,
    series: {
      type: DataTypes.STRING,
    },
    serielNum: {
      type: DataTypes.STRING,
    },
    section: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "codeformat",
  }
);

const ClinicMaster = sequelize.define(
  "clinicMaster",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clinicName: {
      type: DataTypes.STRING,
    },
    clinicLocation: {
      type: DataTypes.STRING,
    },
    clinicAddress: {
      type: DataTypes.STRING,
    },
    clinicEmail: {
      type: DataTypes.STRING,
    },
    clinicPhone: {
      type: DataTypes.STRING,
    },
    clinicLogo: {
      type: DataTypes.STRING,
    },
    clinicStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "clinicmaster",
  }
);

const DeseaseTable = sequelize.define(
  "deseaseTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    clinicId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "deseasetable",
  }
);

const TestsTable = sequelize.define(
  "testsTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    disId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false, // If you want to manage the timestamps manually
    tableName: "teststable",
  }
);

const MedicineTable = sequelize.define(
  "medicationTable",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.JSON,
    },
    disId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
    tableName: "medicationtable",
  }
);

// DeseaseTable.sync({ alter: true });

// TestsTable.sync({ alter: true });

// MedicineTable.sync({ alter: true });

// ClinicMaster.sync({ alter: true });

// sequelize.sync({ alter: true });

// CodeFormat.sync({alter:true});

// DoctorTimeTable.sync({alter:true});

// SMSTemplate.sync({ alter: true });

// UserNotification.sync({ alter: true });

// UserAppointment.sync({ alter: true });

// NotificationTable.sync({ alter: true });

// doctor_staff_Status.sync({ alter: true });

// my_Notes.sync({ alter: true });

// UserTokens.sync({ alter: true });

// sequelize.sync({ alter: true });

module.exports = {
  UserTokens,
  Clinic,
  Speciality,
  Symptoms,
  Tests,
  Services,
  Items,
  Doctors,
  Patient,
  Expenses,
  Staff,
  EmrComplaints,
  EmrExamination,
  EmrHistory,
  EmrPrescription,
  EmrRecommendedTests,
  Bill,
  Visit,
  Appointment,
  my_Notes,
  UserTokens,
  doctor_staff_Status,
  ItemManager,
  ExpenseManager,
  PurchaseClient,
  UserNotification,
  UserAppointment,
  SMSTemplate,
  NotificationTable,
  DoctorTimeTable,
  CodeFormat,
  ClinicMaster,
  DeseaseTable,
  TestsTable,
  MedicineTable,
};
