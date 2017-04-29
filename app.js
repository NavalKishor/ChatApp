var express=require('express');
var app=express();
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
 users={};
//server.listen(4000);
var port = process.env.PORT || 8080;
    server.listen(port);
//var server=app.listen(port,function(req,res){
//    console.log("Catch the action at http://localhost:"+port);
//});
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res){
	res.render('index');
});


io.sockets.on('connection',function(socket){
	console.log("A new connection is made");
	socket.on('new user',function(data,callback){
	if(data in users)
	{
		console.log("Nickname alredy taken,please try another nickename");
		callback(false);
	}
	else
	{
		console.log("Nickname is available");
		callback(true);
		socket.nickname=data;
		users[socket.nickname]=socket;
		updateNicknames();
	}
		
	});
	function updateNicknames(){
		io.sockets.emit('usernames',Object.keys(users));
	}
	
	socket.on('send message',function(data,callback){
		var msg=data.trim();
		if(msg.substr(0,1)==='@')
		{
			msg=msg.substr(1);
			var ind=msg.indexOf(' ');
			if(ind!==-1)
			{
				var name=msg.substring(0,ind);
				var msg=msg.substring(ind+1);
				if(name in users)
				{
					users[name].emit('whisper',{msg:msg,nick:socket.nickname});
					socket.emit('private',{msg:msg,nick:name});
					console.log("Whispering !!!");
				}
				else
				{
					callback("Sorry,"+name+" is not online");
				}
				
			}
			else
			{
				callback("Looks like you forget the message");
			}
			
		}
		else
		{
			console.log("Got The message:"+data);
			io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
		}
	});
	
	 
	 
	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
	
});


