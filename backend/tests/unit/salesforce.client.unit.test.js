jest.mock("axios");

const axios = require("axios");
const salesforceClient = require("../../src/clients/salesforce.client");

describe("salesforce.client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    salesforceClient.__resetTokenCache();
  });

  test("reuses cached token before expiry", async () => {
    axios.post.mockResolvedValueOnce({
      data: { access_token: "cached-token", expires_in: 3600 }
    });

    const token1 = await salesforceClient.getToken();
    const token2 = await salesforceClient.getToken();

    expect(token1).toBe("cached-token");
    expect(token2).toBe("cached-token");
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test("refreshes token when expired", async () => {
    axios.post
      .mockResolvedValueOnce({ data: { access_token: "short-lived", expires_in: 60 } })
      .mockResolvedValueOnce({ data: { access_token: "refreshed", expires_in: 3600 } });

    const token1 = await salesforceClient.getToken();
    const token2 = await salesforceClient.getToken();

    expect(token1).toBe("short-lived");
    expect(token2).toBe("refreshed");
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
