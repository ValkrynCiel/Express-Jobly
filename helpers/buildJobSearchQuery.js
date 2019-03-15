/**  */


function buildSearchJobQuery({ search, min_salary, min_equity }){        
        
    let args = [];
    let params = [];
    
    if (search){
        args.push(`title ILIKE $${args.length + 1}`);
        params.push(`%${search}%`);
    }
    if (min_salary){
        args.push(`salary > $${args.length + 1}`);
        params.push(min_salary);
    }
    if (min_equity){
        args.push(`equity < $${args.length + 1}`);
        params.push(min_equity);
    }

    let query = `SELECT id, title, date_posted, salary, equity
                    FROM jobs`; 

    if (args.length > 0){
        query += ` WHERE ${args.join(' AND ')}`;
    }

    query += ` ORDER BY date_posted DESC, company_handle, title`;

    return { query, params };
}

module.exports = buildSearchJobQuery;