/*required module*/
const express = require('express');

/* helper functions*/
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const User = require('../models/user')

/* Schemas */
const jsonschema = require('jsonschema');
const postUserSchema = require('../schemas/postUser.json');
const patchUserSchema = require('../schemas/patchUser.json');

/* Security */
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const OPTIONS = {expiresIn: 60*60};

const router = express.Router();

/* create a user and receive token on success */
router.post("/", async function(req, res, next) {
    try{
        let result = jsonschema.validate(req.body, postUserSchema);

        if (!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        const { username, password, first_name, last_name, email, photo_url } = req.body;

        let user = await User.addUser({ username, password, first_name, last_name, email, photo_url });
        
        let is_admin = user.is_admin;

        let token = jwt.sign({username, is_admin}, SECRET_KEY, OPTIONS);
        return res.status(201).json({ token });
    }
    catch(err){
        return next(err);
    }
});

/* GET all users */
router.get("/", async function(req, res, next) {
    try{
        let users = await User.getAllUsers();
        return res.json({ users }); 
    }
    catch(err){
        next(err);
    }
});

/* GET user given username */
router.get('/:username', async function(req, res, next){
    try{
        let username = req.params.username;
        let user = await User.getByUsername(username);

        if (user === undefined){
            throw new ExpressError(`No user with username: ${username}`, 404);
        }

        return res.json({ user });
    }
    catch(err){
        return next(err);
    }
});

/* update a user given username if logged in and correct user logged in, return unauthorized otherwise */
router.patch("/:username", 
             ensureLoggedIn, 
             ensureCorrectUser,
             async function(req, res, next){
    try{
        debugger;
        let result = jsonschema.validate(req.body, patchUserSchema);

        if (!result.valid){
            let listOfErrors = result.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        
        let { first_name, last_name, email, photo_url } = req.body

        let items = { first_name, last_name, email, photo_url };
        let id = req.params.username;

        let partialUpdateQuery = sqlForPartialUpdate('users', items, 'username', id);

        let user = await User.updateUser(partialUpdateQuery);

        if (user === undefined){
            throw new ExpressError(`No user with id: ${id}`, 404);
        }

        return res.json({ user });
        
    }
    catch(err){
        next(err);
    }

});
/* delete a user given username if logged in and the correct user, return unauthorized otherwise */
router.delete('/:username', 
               ensureLoggedIn, 
               ensureCorrectUser,
               async function(req, res, next){
    try{
        let username = req.params.username;
        let deletedUser = await User.deleteUser(username);

        if(deletedUser === undefined){
            throw new ExpressError(`No such user: ${username}`,404);
        }

        return res.json({"message":"User deleted"});
    }
    catch(err){
        next(err);
    }
});


module.exports = router;