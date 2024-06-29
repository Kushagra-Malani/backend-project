class ApiError extends Error{
    constructor(
        statusCode, // give the statuscode
        message = "Something went wrong",   // give a custom msg or this default msg will be displayed
        errors = [], // give an array of errors
        stack = ""  // give an error stack

    ) {
        super(message) // used to overwrite message
        this.statusCode = statusCode  // overwrite the statusCode from the statusCode we gave in the constructor
        this.data = null
        this.message = message  // overwriting message also
        this.success = false  // as we are handling API errors, we set success flag to false
        this.errors = errors  // overwrite the errors array from our errors array that we gave in the constructor       
        
        if (stack) {
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}   