app.get('/api/results/:city', function(req,res){
var results=[];
var userid;
if(req.user)
 userid=req.user.id;
 else userid=0;
 var city = req.params.city;
   yelp.search({ term: 'food', location: city })
  .then(function (data) {
    var businesses = data.businesses;
    for(var i=0; i<businesses.length; i++){
      businesses[i].userid=userid;
      if(i<businesses.length-1){
          getit(businesses[i],function(err,result){
            var bus=result[result.length-1];
            results.push({'rest-id': bus.id, 'going':result.length-1, 'name': bus.name, 'snippet_text' : bus.snippet_text, 'image_url':bus.image_url, 'isgoing': bus.isgoing});  
          });
      }
      else{
          getit(businesses[i].id,function(err,result){
            var bus=result[result.length-1];
            results.push({'rest-id': bus.id, 'going':result.length-1, 'name': bus.name, 'snippet_text' : bus.snippet_text, 'image_url':bus.image_url});  
            var str = JSON.stringify(results, null, 2); 
          res.end(str);
        });
      }
  }
  });
});

function getit(where,cb){
  var bus={};
  bus.name=where.name;
  bus.snippet_text=where.snippet_text;
  bus.id=where.id;
  bus.image_url=where.image_url;
  var userid = where.userid;
  var isgoing=false;
  Going.distinct('whoid', {'restid' : where.id},function(err,result){
    for(var i=0; i<result.length; i++){
      if(userid==result[i]) isgoing=true;
    }
     bus.isgoing=isgoing;
     result.push(bus);
     success: cb(err,result);
  } 
)};