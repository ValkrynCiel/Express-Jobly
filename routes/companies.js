/*required module */
const express = require('express');

/*Helper functions */
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

const Company = require('../models/company')

const jsonschema = require('jsonschema');
const postCompanySchema = require('../schemas/postCompany.json');
const patchCompanySchema = require('../schemas/patchCompany.json');

const { ensureLoggedIn, ensureIsAdmin } = require('../middleware/auth');

const router = express.Router();

/** Route to get company information given a search term, min employees, and or max employees. Returns {companies: [{handle]} */
router.get("/", 
            ensureLoggedIn, 
            async function(req, res, next) {
    try{
        let {search, min_employees, max_employees} = req.query;
        if (min_employees && !Number.isInteger(+min_employees) || max_employees && !Number.isInteger(+max_employees)){
            throw new ExpressError("min_employees and max_employees must be integers", 400);
        }
        if (min_employees > max_employees){
            throw new ExpressError("min_employees cannot be greater than max_employees", 400);
        }
        let companies = await Company.searchByQuery({search, min_employees, max_employees});
        return res.json({companies}); 
    }
    catch(err){
        next(err);
    }
});

/*Route to get a company by its handle. Returns {company: companyData} */
router.get('/:handle', 
            ensureLoggedIn, 
            async function(req, res, next){
    try{
        let handle = req.params.handle;
        let company = await Company.getByHandle(handle);

        if (company === undefined){
            throw new ExpressError(`No company with name: ${handle}`, 404);
        }

        return res.json({company});
    }
    catch(err){
        return next(err);
    }
});


/* Create a new company if logged in and is admin */
router.post("/", 
            ensureLoggedIn, 
            ensureIsAdmin, 
            async function(req, res, next) {
    try{
        let result = jsonschema.validate(req.body, postCompanySchema);

        if (!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        const {handle, name, num_employees, description, logo_url} = req.body;
        let company = await Company.addCompany({handle, name, num_employees, description, logo_url});
        return res.status(201).json({company});
    }
    catch(err){
        return next(err);
    }
});

/* update a company if logged in and is admin */
router.patch("/:handle", 
              ensureLoggedIn, 
              ensureIsAdmin, 
              async function(req, res, next){
    try{

        let result = jsonschema.validate(req.body, patchCompanySchema);

        if (!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        
        let { name, num_employees, description, logo_url } = req.body

        let items = { name, num_employees, description, logo_url };
        let id = req.params.handle;

        let partialUpdateQuery = sqlForPartialUpdate('companies', items, 'handle', id);

        let company = await Company.updateCompany(partialUpdateQuery);

        return res.json({company});
        
    }
    catch(err){
        next(err);
    }

});

/* delete a company  by handle if logged in and is admin */
router.delete('/:handle', 
               ensureLoggedIn, 
               ensureIsAdmin, 
               async function(req, res, next){
    try{
        let handle = req.params.handle;
        let deletedCompany = await Company.deleteCompany(handle);

        if(deletedCompany === undefined){
            throw new ExpressError(`No such company: ${handle}`,404);
        }

        return res.json({"message":"Company deleted"});
    }
    catch(err){
        next(err);
    }
});

module.exports = router;