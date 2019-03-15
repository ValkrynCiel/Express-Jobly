/**  */


function buildSearchQuery({search, min_employees, max_employees}){        
        
    let args = [];
    let params = [];
    
    if (search){
        args.push(`name ILIKE $${args.length + 1}`);
        params.push(`%${search}%`)
    }
    if (min_employees){
        args.push(`num_employees > $${args.length + 1}`);
        params.push(min_employees)
    }
    if (max_employees){
        args.push(`num_employees < $${args.length + 1}`)
        params.push(max_employees)
    }

    let query = `SELECT handle, name 
                    FROM companies`; 

    if (args.length > 0){
        query += ` WHERE ${args.join(' AND ')}`
    }

    return { query, params }
}

module.exports = buildSearchQuery;