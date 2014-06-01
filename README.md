mysql-myrules
=============
now with 100% more postgres and 100% less mysql

call postgres functions like this
```js
var procHelper = require('mysql-myrules');
return procHelper.call('create_order', [1,2,3,'hello'])
	.then(function(result){
	});
```
