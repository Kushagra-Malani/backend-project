class ApiResponse {
    constructor(statusCode, data, message="Success") {   // as we are sending a response so, we send statusCode, data & message which is by default as "Success" 
        this.statusCode  =statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400   // as statusCode greater than 400 are for errors & less than 400 for responses
    }
}