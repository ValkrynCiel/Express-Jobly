const buildSearchQuery = require("../helpers/buildSearchQuery");
const db = require("../db");

/* Company class model*/
class Company {
  /** Query database for company given a search term, min employee, or max employee and returns an array of companies.*/
  static async searchByQuery({ search, min_employees, max_employees }) {
    let { query, params } = buildSearchQuery({
      search,
      min_employees,
      max_employees
    });

    const companiesResult = await db.query(query, params);

    return companiesResult.rows;
  }
  /**  Add a new company given handle, name, num_employess, description, and logo_url. Returns company made*/
  static async addCompany({
    handle,
    name,
    num_employees,
    description,
    logo_url
  }) {
    try {
      const result = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
                VALUES ($1, $2, $3, $4, $5)
                RETURNING handle, name, num_employees, description, logo_url`,
        [handle, name, num_employees, description, logo_url]
      );
      return result.rows[0];
    } catch (err) {
      throw { message: "Company handle and name must be unique", status: 409 };
    }
  }
  /**Given a valid JSON with query and values, change values of a company and returns the new values of that company.  */
  static async updateCompany({ query, values }) {
    try {
      const update = await db.query(query, values);

      return update.rows[0];
    } catch (err) {
      throw {
        message:
          "Must update at least one of the following: name, num_employees, description, logo_url",
        status: 400
      };
    }
  }

  /** Given a company handle, return the company information. */
  static async getByHandle(handle) {
    try{
      let companyData = await db.query(
        `SELECT handle, name, num_employees, description, logo_url
              FROM companies
              WHERE handle=$1`,
        [handle]
      );

      let jobsData = await db.query(
        `SELECT id, title, date_posted, equity, salary
        FROM jobs
        WHERE company_handle=$1
        ORDER BY date_posted DESC`,
        [handle]
      )

      let { ...companyInfo } = companyData.rows[0];

      return { ...companyInfo, jobs: jobsData.rows };
    } catch (err) {
      throw { message: `No company with handle: ${handle}`,
              status: 404 };
    }
  }

  /** Delete a company given the handle and returns the company that was deleted. */
  static async deleteCompany(handle) {
    let deletedCompany = await db.query(
      `DELETE from companies 
            WHERE handle =$1
            RETURNING handle`,
      [handle]
    );
    return deletedCompany.rows[0];
  }
}

module.exports = Company;
