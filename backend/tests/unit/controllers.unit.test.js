const { syncUser } = require("../../src/controllers/user.controller");
const { invokeAction } = require("../../src/controllers/salesforce.controller");

jest.mock("../../src/services/user.service", () => ({
  syncUserWithSalesforce: jest.fn()
}));

jest.mock("../../src/services/salesforce.service", () => ({
  callIntegration: jest.fn()
}));

const { syncUserWithSalesforce } = require("../../src/services/user.service");
const { callIntegration } = require("../../src/services/salesforce.service");

describe("controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("user controller maps request user to sync service", async () => {
    syncUserWithSalesforce.mockResolvedValueOnce({ existing: true });

    const req = { user: { uid: "uid-1", email: "john@example.com" } };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await syncUser(req, res, next);

    expect(syncUserWithSalesforce).toHaveBeenCalledWith("uid-1", "john@example.com", "john");
    expect(res.json).toHaveBeenCalledWith({ existing: true });
    expect(next).not.toHaveBeenCalled();
  });

  test("salesforce controller forwards action and payload", async () => {
    callIntegration.mockResolvedValueOnce({ data: "ok" });

    const req = {
      params: { action: "listCatalogs" },
      body: { defaultCatalogName: "Default" },
      user: { uid: "uid-1" }
    };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await invokeAction(req, res, next);

    expect(callIntegration).toHaveBeenCalledWith("listCatalogs", { defaultCatalogName: "Default" });
    expect(res.json).toHaveBeenCalledWith({ user: "uid-1", data: { data: "ok" } });
    expect(next).not.toHaveBeenCalled();
  });
});
