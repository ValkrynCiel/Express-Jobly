process.env.NODE_ENV = 'test';
const Company = require('../../models/company');
const db = require('../../db');
const partialUpdate = require('../../helpers/partialUpdate')

beforeEach(async function () {
    await db.query(`INSERT INTO companies (handle, name, num_employees, description, logo_url)
                    VALUES ('TEST1', 'Test Co1', 1000, 'test description1', 'test_url1'),
                           ('TEST2', 'Test Co2', 2000, 'test description2', 'test_url2'),
                           ('TEST3', 'Test Co3', 3000, 'test description3', 'test_url3')`)
});

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
});

afterAll(async function(){
    await db.end();
});

describe("Company.searchByQuery()", function() {
    test("gets all companies", async function(){
        let search;
        let min_employees;
        let max_employees;

        const response = await Company.searchByQuery({ search, min_employees, max_employees });

        expect(response).toHaveLength(3);
        expect(response[0]).toMatchObject({
            handle: expect.any(String),
            name: expect.any(String)
        });
    });

    test("gets 1 company by search term", async function(){
        let search = "1";
        let min_employees;
        let max_employees;

        const response = await Company.searchByQuery({ search, min_employees, max_employees });

        expect(response).toHaveLength(1);
        expect(response[0]).toEqual({handle: "TEST1", name: "Test Co1"})
    });

    test("gets 2 companies by search term and max_employees", async function(){
        let search = "Test";
        let min_employees;
        let max_employees = 2500;

        const response = await Company.searchByQuery({ search, min_employees, max_employees });
        const expected = [{handle:'TEST3', name:'Test Co3'}]

        expect(response).toHaveLength(2);
        expect(response).toEqual(expect.not.arrayContaining(expected))
    });

    test("gets 1 company by search term, min_employees, and max_employees", async function(){
        let search = "Test";
        let min_employees = 1500;
        let max_employees = 2500;

        const response = await Company.searchByQuery({ search, min_employees, max_employees });
        const expected = [{handle:'TEST1', name:'Test Co1'}, {handle:'TEST3', name:'Test Co3'}]

        expect(response).toHaveLength(1);
        expect(response).toEqual(expect.not.arrayContaining(expected))
    });
})


describe("Company.addCompany()", function() {
    test("add a new company", async function(){
        let handle = 'TEST4';
        let name = 'Test Co4';
        let num_employees = 4000;
        let description = 'test description4';
        let logo_url = 'test_url4';

        const response = await Company.addCompany({ handle, name, num_employees, description, logo_url });

        
        expect(response).toEqual({ handle:'TEST4', 
                                   name:'Test Co4', 
                                   num_employees:4000,
                                   description: 'test description4',
                                   logo_url: 'test_url4'});

        const records =  await Company.searchByQuery({search:'Test Co4', 
                                                      min_employees:undefined,
                                                      max_employees:undefined});
        expect(records).toHaveLength(1);
        expect(records[0]).toEqual({handle: "TEST4", name: "Test Co4"})
    });

    test("reject adding company with existing handle", async function(){
        let handle = 'TEST3';
        let name = 'Test Co4';
        let num_employees = 4000;
        let description = 'test description4';
        let logo_url = 'test_url4';

        try {
            await Company.addCompany({ handle, name, num_employees, description, logo_url });
        } catch (e) {
            expect(e).toEqual({ 
                message: "Company handle and name must be unique", 
                status: 409 
            });
        }
    });

    test("reject adding company with existing name", async function(){
        let handle = 'TEST4';
        let name = 'Test Co3';
        let num_employees = 4000;
        let description = 'test description4';
        let logo_url = 'test_url4';

        try {
            await Company.addCompany({ handle, name, num_employees, description, logo_url });
        } catch (e) {
            expect(e).toEqual({ 
                message: "Company handle and name must be unique", 
                status: 409 
            });
        }
    });

});

describe("Company.updateCompany()", function() {
    test("update columns of company", async function(){

        let items = {name: "newTest1",
                     num_employees: 1}

        const queryObject = partialUpdate("companies", items, "handle", "TEST1")

        const response = await Company.updateCompany(queryObject)

        
        expect(response).toEqual({ handle:'TEST1', 
                                   name:'newTest1', 
                                   num_employees:1,
                                   description: 'test description1',
                                   logo_url: 'test_url1'});

    
    });

    test("throw error when there is nothing to update", async function(){
        const queryObject = partialUpdate("companies", {}, "handle", "TEST1")
        
        try {
            await Company.updateCompany(queryObject)
        } catch (err) {
            expect(err).toEqual({ 
                message: "Must update at least one of the following: name, num_employees, description, logo_url", 
                status: 400 
            });
        }
        
    });

});

describe("Company.getByHandle()", function() {
    test("get company by handle", async function(){

        const response = await Company.getByHandle("TEST3");

        
        expect(response).toEqual({ handle:'TEST3', 
                                   name:'Test Co3', 
                                   num_employees:3000,
                                   description: 'test description3',
                                   logo_url: 'test_url3'});

    
    });

    test("return undefined when company cannot be found", async function(){
        const response = await Company.getByHandle("TEST1000000");

        expect(response).toEqual(undefined);
        
    });

    
});

describe("Company.deleteCompany()", function() {
    test("successful deletion", async function(){

        const response = await Company.deleteCompany("TEST2");
        
        expect(response).toEqual({ handle:'TEST2', 
                                   name:'Test Co2'});

    
    });

    test("return undefined when company doesn't exist", async function(){
        const response = await Company.getByHandle("TEST1000000");

        expect(response).toEqual(undefined);
        
    });

    
});
