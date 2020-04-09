const { Neo } = require('./neo2');

(async () => {
  
  const neo1 = await Neo({
    path: "./src/test.neo",
    page: null
  });

  console.log({neo1});

})();