process.env.NODE_ENV = "test";

const app = require("../../app");
const db = require("../../db");
const request = require("supertest");



beforeEach(async function () {
    await db.query(`INSERT INTO companies (handle, name, num_employees, description, logo_url)
                    VALUES ('TEST1', 'Test Co1', 1000, 'test description1', 'test_url1'),
                           ('TEST2', 'Test Co2', 2000, 'test description2', 'test_url2'),
                           ('TEST3', 'Test Co3', 3000, 'test description3', 'test_url3')`)


    await db.query(`INSERT INTO jobs (id,title, salary, equity, company_handle)
                    VALUES (1,'TESTER1', 1000, 0.1, 'TEST1'),
                           (2,'TESTER2', 2000, 0.2, 'TEST2'), 
                           (3000,'TESTER3', 3000, 0.3, 'TEST3')`)

});

afterEach(async function () {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM jobs`);
});

afterAll(async function () {
    await db.end();
});

describe("POST /jobs", function () {
    test("Create new job", async function () {
        const response = await request(app)
            .post('/jobs/')
            .send({ title: "TESTER4", salary: 4000, equity: 0.4, company_handle: "TEST3" })

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            job: {
                title: expect.any(String),
                salary: expect.any(Number),
                equity: expect.any(Number),
                company_handle: expect.any(String)
            }
        });

        const getResp = await request(app)
            .get('/jobs/')

        expect(getResp.statusCode).toBe(200);
        expect(getResp.body.jobs).toHaveLength(4);
    });

    test("throw error if company handle doesn't exist", async function () {
        const response = await request(app)
            .post('/jobs/')
            .send({ title: "TESTER5", salary: 5000, equity: 0.4, company_handle: "TEST0" })

        expect(response.statusCode).toBe(404);

        expect(response.body).toMatchObject({
            message: 'No company with handle TEST0',
            status: 404
        });
    });

    test("throw error when require fields are not provided", async function () {
        const response = await request(app)
            .post('/jobs/')
            .send({ title: "TESTER5" })

        expect(response.statusCode).toBe(400);

        expect(response.body).toMatchObject({
            message: expect.any(Array),
            status: 400
        });
    });

    test("throw error if required fields are invalid", async function () {
        const response = await request(app)
            .post('/jobs/')
            .send({ title: 30, salary: 5000.349, equity: 0.423, company_handle: "TEST0" })

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: expect.any(Array),
            status: 400
        });
        expect(response.body.message).toHaveLength(3);

    });

});

describe("GET /jobs", function () {
    test("Get all jobs", async function () {
        const response = await request(app)
            .get('/jobs/')

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            jobs: expect.any(Array)
        });

        expect(response.body).toEqual({
            jobs: [ 
                {
                    id: expect.any(Number),
                    title: "TESTER1",
                    date_posted: expect.any(String),
                    salary: 1000,
                    equity: 0.1
                },
                {
                    id: expect.any(Number),
                    title: "TESTER2",
                    date_posted: expect.any(String),
                    salary: 2000,
                    equity: 0.2
                },
                {
                    id: expect.any(Number),
                    title: "TESTER3",
                    date_posted: expect.any(String),
                    salary: 3000,
                    equity: 0.3
                },
            ]
            
        });
    });
});       
  

describe("GET /jobs/[id]", function () {
    test("Get job by id", async function () {
        const response = await request(app)
            .get('/jobs/3000')

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            job:
                {
                    title: "TESTER3",
                    salary: 3000,
                    equity: 0.3,
                    company_handle: 'TEST3'
                },
            
            
        });
    });
});       

