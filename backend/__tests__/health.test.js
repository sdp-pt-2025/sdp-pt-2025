import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
    it("should respond with a status 200 and a json object", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "ok" });
    });

});

