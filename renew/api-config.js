/* Connected to Renew backend server with Firestore and Gemini AI */
window.RENEW_API_CONFIG = {
  mode: "connected",
  endpoints: {
    leadSubmission: "/api/leads",
    photoUpload: "/api/lead-photos",
    leadStatus: "/api/leads/status",
    markDashboard: "dashboard.html"
  },
  features: {
    geminiSummary: true,
    firestore: true,
    firebaseStorage: true,
    placesAutocomplete: true,
    addressValidation: true,
    googleCalendar: false,
    transactionalEmail: true,
    sms: false,
    payments: false
  }
};
