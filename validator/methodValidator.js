const {check} = require('express-validator');
exports.validate = (method) => {
    switch (method) {
        case 'createUser': {
            return [
                check('name', "Name is required").isString().isLength({min: 1}),
                check('lastname', "Last Name is required").isString().isLength({min: 1}),
                check('secondlastname').optional({checkFalsy: true}).isString(),
                check('email', 'Invalid email').exists().isEmail(),
                check('telephone', "Telephone must be 8 numbers").optional({checkFalsy: true}),
                check('cellular', "Cellular must be 8 numbers").optional({checkFalsy: true}),
                check('ext', 'Must be between 1 to 4 characters').optional({checkFalsy: true}),
                check('type', "Role is required").isInt()
            ];
        }
            break;
        case 'updateUser': {
            return [
                check('name', "Name is required").isString().isLength({min: 1}),
                check('lastname', "Last Name is required").isString().isLength({min: 1}),
                check('secondlastname').optional({checkFalsy: true}).isString(),
                check('email', 'Invalid email').exists().isEmail(),
                check('telephone', "Telephone must be 8 numbers").optional({checkFalsy: true}),
                check('cellular', "Cellular must be 8 numbers").optional({checkFalsy: true}),
                check('ext', 'Extension must be between 1 to 4 characters').optional({checkFalsy: true}),
                check('type', "Role is required").isInt()
            ];
        }
            break;
    }
};
