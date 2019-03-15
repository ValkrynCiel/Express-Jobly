
const buildJobSearchQuery = require('../helpers/buildJobSearchQuery');
const db = require('../db');

class Job{
    /** Add a new job post into the database given title, salary, equity, and company_handle */
    static async addJob({ title, salary, equity, company_handle }){
        try{
        let result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES($1, $2, $3, $4)
             RETURNING title, salary, equity, company_handle 
            `, [title, salary, equity, company_handle ]);
            
        return result.rows[0];
        }
        catch(err){
            throw { message: `No company with handle ${company_handle}`, 
                    status:404 };
        }
    }

    /** Query database for job given a search term, min salary, or max salary and returns an array of companies.*/
    static async searchByQuery({ search, min_salary, min_equity }) {
        let { query, params } = buildJobSearchQuery({
          search,
          min_salary,
          min_equity
        });
    
        const jobResult = await db.query(query, params);
    
        return jobResult.rows;
    }
    /** get a job by its id */
    static async getById(id) {
      let job = await db.query(
        `SELECT title, salary, equity, company_handle
               FROM jobs
               WHERE id=$1`,
        [id]
      );
  
      
      return job.rows[0];
    }
    /** Update a job given query and values as its parameter */
    static async updateJob({ query, values }){
        try {
          debugger;
            const update = await db.query(query, values);
      
            return update.rows[0];
          } catch (err) {
            throw {
              message:
                "Must update at least one of the following: title, salary, equity",
              status: 400
            };
          }
    }

    /** delete a job given the job id*/
    static async deleteJob( id ){
        let deletedJob = await db.query( 
            `DELETE from jobs
            WHERE id=$1
            RETURNING id`, [id]
        );
        return deletedJob.rows[0];
    }
      
    
}


module.exports = Job