var express = require('express'),
	bodyParser = require('body-parser'),
	multparty = require('connect-multiparty'),
	mongodb = require('mongodb');
	objectId = require('mongodb').ObjectId,
	fs = require('fs');// modulo nativo do node para manipular arquivos

var app = express();

// body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multparty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
	'instagram',
	new mongodb.Server('localhost', 27017, {}),
	{}
	);

console.log('Servidor HTTP esta escutando na porta ' + port);

app.get('/', function(req, res){
	res.send({msg: 'Olá Postman'});
});


//POST (create)
app.post('/api', function(req, res){

	//res.setHeader('Access-Control-Allow-Origin', 'http://localhost:80');
	res.setHeader('Access-Control-Allow-Origin', '*'); //asteristico response para qlqr dominio

	var date = new Date();
	var time_stamp = date.getTime();

	var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

	var path_origin = req.files.arquivo.path;
	var path_destino = './uploads/' + url_imagem;

	

	fs.rename(path_origin, path_destino, function(err){
		if(err){
			res.status(500).json({error: err});
			return;
		}

		var dados = {
			url_imagem: url_imagem,
			titulo: req.body.titulo
		}

		db.open( function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.insert(dados, function(err, result){
				if (err) {
					res.json({'status' : 'erro'});
				} else {
					res.json({'status' : 'inclusão realizada com sucesso'});
				}

				mongoclient.close();
			});
		});
	});

	});
});


//GET (ready)
app.get('/api', function(req, res){

	db.open( function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find().toArray( function(err, result){
				if (err) {
					res.json(err);
				} else {
					res.json(result);
				}

				mongoclient.close();
			});
			
		});
		
	});
});

//GET BY ID (ready)
app.get('/api/:id', function(req, res){

	db.open( function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.find(objectId(req.params.id)).toArray( function(err, result){
				if (err) {
					res.json(err);
				} else {
					res.json(result);
				}

				mongoclient.close();
			});
			
		});
		
	});
});

//PUT BY ID (update)
app.put('/api/:id', function(req, res){

	db.open( function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.update(
				{ _id: objectId(req.params.id) },
				{ $set : { titulo : req.body.titulo}},
				{},
				function(err, records){
					if(err){
						res.json(err);
					} else {
						res.json(records);
					}
				}
			);
			
		});
		
	});
});

//DELETE by ID
app.delete('/api/:id', function(req, res){

	db.open( function(err, mongoclient){
		mongoclient.collection('postagens', function(err, collection){
			collection.remove({ _id : objectId(req.params.id) }, function(err, records){
				if(err){
					res.status(400).json(err);
				} else {
					res.status(200).json(records);
				}

				mongoclient.close();
			});
			
		});
		
	});
});