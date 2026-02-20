const request = require("supertest");

jest.mock("axios");
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

const axios = require("axios");
const firebaseAdmin = require("firebase-admin");
const salesforceClient = require("../../src/clients/salesforce.client");
const { createApp } = require("../../src/app");

describe("API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firebaseAdmin.__reset();
    salesforceClient.__resetTokenCache();
  });

  test("GET / returns backend status", async () => {
    const app = createApp();

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "Backend running" });
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("POST /api/sync-user without token returns 401 Missing token", async () => {
    const app = createApp();

    const response = await request(app).post("/api/sync-user").send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Missing token" });
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("POST /api/sync-user with invalid token returns 401 Invalid token", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockRejectedValueOnce(new Error("invalid"));

    const app = createApp();

    const response = await request(app)
      .post("/api/sync-user")
      .set("Authorization", "Bearer bad-token")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid token" });
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  test("POST /api/sync-user returns existing Salesforce contact", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({
      uid: "uid-1",
      email: "user@example.com",
      name: "User"
    });

    axios.post.mockResolvedValueOnce({ data: { access_token: "sf-token", expires_in: 3600 } });
    axios.get.mockResolvedValueOnce({
      data: {
        records: [{ Id: "003existing", AccountId: "001existing" }]
      }
    });

    const app = createApp();

    const response = await request(app)
      .post("/api/sync-user")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      contactId: "003existing",
      accountId: "001existing",
      existing: true
    });
  });

  test("POST /api/sync-user creates account and contact when none exists", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({
      uid: "uid-2",
      email: "new.user@example.com",
      name: "New User"
    });

    axios.post
      .mockResolvedValueOnce({ data: { access_token: "sf-token", expires_in: 3600 } })
      .mockResolvedValueOnce({ data: { id: "001new" } })
      .mockResolvedValueOnce({ data: { id: "003new" } });

    axios.get.mockResolvedValueOnce({ data: { records: [] } });

    const app = createApp();

    const response = await request(app)
      .post("/api/sync-user")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      contactId: "003new",
      accountId: "001new",
      existing: false
    });
  });

  test("POST /api/sync-user returns 409 with duplicate details when Salesforce duplicate rule triggers", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({
      uid: "uid-dup",
      email: "dup.user@example.com",
      name: "Dup User"
    });

    axios.post
      .mockResolvedValueOnce({ data: { access_token: "sf-token", expires_in: 3600 } })
      .mockResolvedValueOnce({ data: { id: "001new" } })
      .mockRejectedValueOnce({
        response: {
          data: [
            {
              duplicateResult: {
                allowSave: true,
                duplicateRule: "Standard_Contact_Duplicate_Rule",
                duplicateRuleEntityType: "Contact",
                errorMessage: "Use one of these records?",
                matchResults: []
              },
              errorCode: "DUPLICATES_DETECTED",
              message: "Use one of these records?"
            }
          ]
        }
      });

    axios.get.mockResolvedValueOnce({ data: { records: [] } });

    const app = createApp();

    const response = await request(app)
      .post("/api/sync-user")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "Use one of these records?",
      code: "DUPLICATES_DETECTED"
    });
  });

  test("POST /api/:action forwards action and payload", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({ uid: "uid-3" });

    axios.post
      .mockResolvedValueOnce({ data: { access_token: "sf-token", expires_in: 3600 } })
      .mockResolvedValueOnce({ data: { ok: true } });

    const app = createApp();

    const response = await request(app)
      .post("/api/listCatalogs")
      .set("Authorization", "Bearer valid-token")
      .send({ defaultCatalogName: "Default" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: "uid-3",
      data: { ok: true }
    });
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      "https://example.my.salesforce.com/services/apexrest/api/integration",
      { action: "listCatalogs", defaultCatalogName: "Default" },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sf-token"
        })
      })
    );
  });

  test("POST /api/:action returns route-scoped 500 message on Salesforce failure", async () => {
    firebaseAdmin.__verifyIdTokenMock.mockResolvedValueOnce({ uid: "uid-4" });

    axios.post
      .mockResolvedValueOnce({ data: { access_token: "sf-token", expires_in: 3600 } })
      .mockRejectedValueOnce({ response: { data: { message: "sf down" } } });

    const app = createApp();

    const response = await request(app)
      .post("/api/listProducts")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "listProducts failed" });
  });
});
