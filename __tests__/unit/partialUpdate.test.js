process.env.NODE_ENV = 'test';
const  partialUpdate = require('../../helpers/partialUpdate');




describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
        let table = 'companies';
        let items = {description: 'test description'};
        let key = 'handle';
        let id = 'TEST';

        let partialUpdateResult = partialUpdate(table, items, key, id);
    // FIXME: write real tests!
    expect(partialUpdateResult).toEqual({ query:
      `UPDATE companies SET description=$1 WHERE handle=$2 RETURNING *`,
     values: [ 'test description', 'TEST' ] });

  });

  it("should generate a proper update query with many fields inserted",
      function () {
        let table = 'companies';
        let items = {description: 'test description',
                     name: 'Test1',
                     num_employees: 100,
                     logo_url: 'http://test.com'};
        let key = 'handle';
        let id = 'TEST';

        let partialUpdateResult = partialUpdate(table, items, key, id);
    // FIXME: write real tests!
    expect(partialUpdateResult).toEqual({ query:
      `UPDATE companies SET description=$1, name=$2, num_employees=$3, logo_url=$4 WHERE handle=$5 RETURNING *`,
     values: [ 'test description', 'Test1', 100, 'http://test.com', 'TEST' ] });

  });
});
