const verifyIdTokenMock = jest.fn();

const admin = {
  credential: {
    cert: jest.fn((value) => value)
  },
  initializeApp: jest.fn(() => ({
    auth: () => ({
      verifyIdToken: verifyIdTokenMock
    })
  })),
  __verifyIdTokenMock: verifyIdTokenMock,
  __reset: () => {
    verifyIdTokenMock.mockReset();
    admin.initializeApp.mockClear();
    admin.credential.cert.mockClear();
  }
};

module.exports = admin;
