process.env.NODE_ENV = 'test';
const buildSearchQuery = require('../../helpers/buildSearchQuery');

describe("buildSearchQuery()", () => {
    it("should generate query string with search term only",
        function () {
        let search = "abc";
        let min_employees = undefined;
        let max_employees = undefined;
        let queryResult = buildSearchQuery({ search, min_employees, max_employees });


      expect(queryResult.query).toEqual(expect.stringContaining("SELECT handle, name"));
      expect(queryResult.query).toEqual(expect.stringContaining("FROM companies"));
      expect(queryResult.query).toEqual(expect.stringContaining("WHERE name ILIKE $1"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("min_employees"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("max_employees"));
      expect(queryResult.params).toEqual(['%abc%']);
  
    });

    it("should generate query string with search term, min_employees",
        function () {
        let search = "abc";
        let min_employees = 1000;
        let max_employees = undefined;
        let queryResult = buildSearchQuery({ search, min_employees, max_employees });


      expect(queryResult.query).toEqual(expect.stringContaining("SELECT handle, name"));
      expect(queryResult.query).toEqual(expect.stringContaining("FROM companies"));
      expect(queryResult.query).toEqual(expect.stringContaining("WHERE name ILIKE $1 AND num_employees > $2"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("max_employees"));
      expect(queryResult.params).toEqual(['%abc%', 1000]);
  
    });

    it("should generate query string with search term, min_employees, max_employees",
        function () {
        let search = "abc";
        let min_employees = 1000;
        let max_employees = 3000;
        let queryResult = buildSearchQuery({ search, min_employees, max_employees });


      expect(queryResult.query).toEqual(expect.stringContaining("SELECT handle, name"));
      expect(queryResult.query).toEqual(expect.stringContaining("FROM companies"));
      expect(queryResult.query).toEqual(expect.stringContaining("WHERE name ILIKE $1 AND num_employees > $2 AND num_employees < $3"));
      expect(queryResult.params).toEqual(['%abc%', 1000, 3000]);
  
    });

    it("should generate query string with only max_employees",
        function () {
        let search = undefined;
        let min_employees = undefined;
        let max_employees = 3000;
        let queryResult = buildSearchQuery({ search, min_employees, max_employees });


      expect(queryResult.query).toEqual(expect.stringContaining("SELECT handle, name"));
      expect(queryResult.query).toEqual(expect.stringContaining("FROM companies"));
      expect(queryResult.query).toEqual(expect.stringContaining("WHERE num_employees < $1"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("min_employees"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("search"));
      expect(queryResult.params).toEqual([3000]);
  
    });
  
    it("should generate query string no params",
        function () {
        let search = undefined;
        let min_employees = undefined;
        let max_employees = undefined;
        let queryResult = buildSearchQuery({ search, min_employees, max_employees });


      expect(queryResult.query).toEqual(expect.stringContaining("SELECT handle, name"));
      expect(queryResult.query).toEqual(expect.stringContaining("FROM companies"));
      expect(queryResult.query).toEqual(expect.not.stringContaining("WHERE"));
      expect(queryResult.params).toEqual([]);
  
    });
  });
  