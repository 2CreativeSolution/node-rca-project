jest.mock("firebase-admin", () => {
  const verifyIdTokenMock = jest.fn();

  return {
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
    }
  };
});

const firebaseAdmin = require("firebase-admin");
const verifyFirebase = require("../../src/middleware/auth");

describe("auth middleware", () => {
  beforeEach(() => {
    firebaseAdmin.__reset();
  });

  test("returns 401 for missing token", async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await verifyFirebase(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("sets req.user and calls next for valid token", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({ uid: "uid-1" });

    const req = { headers: { authorization: "Bearer good" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await verifyFirebase(req, res, next);

    expect(req.user).toEqual({ uid: "uid-1" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("returns 401 for invalid token", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockRejectedValueOnce(new Error("bad token"));

    const req = { headers: { authorization: "Bearer bad" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await verifyFirebase(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards Firebase initialization failures as 500 errors", async () => {
    jest.resetModules();
    const reloadedFirebaseAdmin = require("firebase-admin");
    reloadedFirebaseAdmin.__reset();
    reloadedFirebaseAdmin.initializeApp.mockImplementationOnce(() => {
      throw new Error("missing firebase credentials");
    });
    const reloadedVerifyFirebase = require("../../src/middleware/auth");

    const req = { headers: { authorization: "Bearer good" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await reloadedVerifyFirebase(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({
      name: "HttpError",
      statusCode: 500,
      message: "Authentication service unavailable"
    });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
