const express = require('express');
const sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const app = express();
var path = require('path');
base_datos = new sqlite3.Database('proyectoweb.db',
    (err) => {
        if (err != null) {
            console.log('Error al abrir BD');
            process.exit();
        }
    }
);

/*=================== SETTINGS ======================
====================================================*/

app.set('port', (process.env.PORT || 4000));
app.use(express.static(path.join(__dirname, './frontend')));


/*=================== SETTINGS ======================
====================================================*/

/*=================== STATIC FILES===================
====================================================*/
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: true
})); // for parsing application/x-www-form-urlencoded

/*=================== STATIC FILES===================
====================================================*/

/*=================== RUTAS =========================
====================================================*/
app.get('/', function (req, res) {
	res.sendFile("index.html");
});

app.get('/mapa', [comprobar_login, function (req, res) {
	res.sendFile(__dirname + "/frontend/mapa.html");
}]);

app.get('/perfil', [comprobar_login, function (req, res) {
	res.sendFile(__dirname + "/frontend/profile.html");
}]);

/*
    Función para comprobar el login
    Si la cookie no está presente o es incorrecta se envia el formulario de acceso.
    En caso contrario se continua el proceso de la petición llamando a siguiente()
*/

function comprobar_login(peticion, respuesta, siguiente)
{
    if ('email' in peticion.cookies && 'password' in peticion.cookies) {
    base_datos.get('SELECT * FROM clientes WHERE email = ? AND password = ?',
            [ peticion.cookies.email, peticion.cookies.password ],
                (error, fila) => {
                    if (error != null)
                        respuesta.sendStatus(500);
                    else if (fila === undefined)
					respuesta.sendStatus(404);
                    else siguiente()
                }
        )
    } else {
		respuesta.sendFile(__dirname + "/frontend/index.html");
    }
}

// ejemplo de petición GET
app.get('/login', (peticion, respuesta) => {
    base_datos.get('SELECT * FROM clientes WHERE email=? AND password=?',
        [ peticion.query.email, peticion.query.password ],
            (error, fila) => {
                if (fila === undefined) {
                    respuesta.sendStatus(401)
                } else {
                    respuesta.json(fila)
                }
        })
})


app.get("/activar", activarUsuario);

/* Método que permite activar a un usuario la primera vez que entra a la aplicación, para que lo lleve directamente a la página de zonas 
y no tengo que pasar por la página de perfil para confirmar sus datos porque ya lo ha hecho la primera vez que inició sesión */

function activarUsuario(req, res) {


	function activarUsuario2(err) {
		if (err) {
			console.log("error: " + err)
		} else {
			res.sendFile(__dirname + "/frontend/mapa.html");
		}

	}
	base_datos.get('UPDATE clientes SET activo=1 WHERE email=?', [req.query.email], activarUsuario2);
}
//-------------------------------------------------------------
//-------------------------------------------------------------
app.get("/sensores", [comprobar_login, pedirSensores]);

/* Método que permite activar a un usuario la primera vez que entra a la aplicación, para que lo lleve directamente a la página de zonas 
y no tengo que pasar por la página de perfil para confirmar sus datos porque ya lo ha hecho la primera vez que inició sesión */

function pedirSensores(req, res) {
	console.log(req.query.email);
	var querySensores = "SELECT sondas.* FROM sondantes INNER JOIN sondas ON sondas.ID_SONDA = sondantes.SONDA WHERE CLIENTE = (SELECT ID FROM clientes WHERE email=?)";
	function pedirSensores2(err, row) {
		if (err) {
			console.log("error: " + err)
		} else {

			res.send(row);
		}
	}
	base_datos.all(querySensores, [req.query.email], pedirSensores2);
}
//-------------------------------------------------------------
//-------------------------------------------------------------


/************** FUNCIÓN CREAR OBJETO ZONA *****************/
function crearObjetoZonas(x) {

	var objetoZona = {}; //variable objeto final
	var objetoVertice = {}; //variable objeto que contiene {LAT,LNG} vertice
	x.forEach(function (orden) {
		objetoZona.zona = orden.ZONA;
		objetoZona.nombre = orden.NOMBRE;
		objetoZona.color = orden.COLOR;
	});
	objetoZona.vertices = []; //array que contendra cada objeto vertice
	//ForEach que recoge cada row 
	x.forEach(function (orden) {

		objetoVertice = {
			lat: parseFloat(orden.LAT),
			lng: parseFloat(orden.LNG)
		};

		objetoZona.vertices.push((objetoVertice));


	});

	return objetoZona;
}

/********************************************************+*/
/* 
Método que permite saber las zonas que hay disponibles en la explotación agrícola, 
de momento la consulta es sobre clientes porque todavía no está la última versión de la base de datos 
*/

app.get("/zonas", [comprobar_login, pedirZonas]);

function pedirZonas(req, res) {
	console.log(req.cookies);
	//consulta para recoger las zonas que tiene el cliente
	var queryZonas = "SELECT ZONA FROM sondas_zonas LEFT JOIN clientes WHERE email=? GROUP BY ZONA;";
	//función que utiliza el resultado de la consulta anterior (numero de cada ZONA) para sacar los vertices de cada ZONA
	function pedirZonas2(err, row) {
		if (err) {
			console.log("error: " + err)
		} else {
			var arrayZonas = []; //declaración de un array que guardara todos los objetos de zona
			var Zona = {};
			var contadorZonas = 0;

			row.forEach(function (zona) {
				contadorZonas++;

				//Consulta que recoge la información de los vertices y zona, de cada una de las zonas que tiene un cliente
				var queryVertice = "SELECT vertice.* , zonas.* FROM vertice INNER JOIN zonas ON zonas.VERTICE_ID=vertice.ZONA WHERE VERTICE_ID=? GROUP BY ORDEN;";
				base_datos.all(queryVertice, [zona.ZONA], function (err, x) {
					if (err) {
						console.log("error: " + err);
					} else {
						Zona = crearObjetoZonas(x);

						arrayZonas.push(Zona); //añade cada objetoZona al final de un array
						/*Si el arrayZonas contiene el mismo numero de zonas que hemos sacado de la base de datos
						hace el envio de la arrayZonas que contiene un objeto por cada zona*/
						if (arrayZonas.length == contadorZonas) {
							res.json(arrayZonas);
						}
					}

				});
			});
		}
	}
	base_datos.all(queryZonas, [req.query.email], pedirZonas2);

}

/********************* HUMEDAD **********************/
app.get("/humedad", [comprobar_login, pedirHumedad]);
/* 
Método que permite mediciones de humedad de una sonda en concreto pasada como parámetro por la url
*/

function pedirHumedad(req, res) {

	var queryHumedad = "SELECT humedad FROM medidas WHERE id =?;";

	function pedirHumedad2(err, row) {
	
		if (err) {
			console.log("error: " + err)
		} else {
			
			res.send(row);
		}

	}
	base_datos.all(queryHumedad, [req.query.id], pedirHumedad2);

}

/*===================================================
====================================================*/

app.get("/temperatura",  [comprobar_login, pedirTemperatura]);

/* 
Método que permite mediciones de temperatura de una sonda en concreto
*/

function pedirTemperatura(req, res) {

	var queryTemperatura = "SELECT temperatura FROM medidas WHERE id =?;";

	function pedirTemperatura2(err, row) {
	
		if (err) {
			console.log("error: " + err)
		} else {
			
			res.send(row);
		}

	}
	base_datos.all(queryTemperatura, [req.query.id], pedirTemperatura2);

}

/*===================================================
====================================================*/

/******************* LUMINOSIDAD ********************/
app.get("/iluminacion",  [comprobar_login, pedirLuminosidad]);
/* 
Método que permite mediciones de luminosidad de una sonda en concreto pasada como parámetro por la url
*/

function pedirLuminosidad(req, res) {

	var queryLuminosidad = "SELECT iluminacion FROM medidas WHERE id =?;";

	function pedirLuminosidad2(err, row) {
		
		if (err) {
			console.log("error: " + err)
		} else {
			res.send(row);
		}

	}
	base_datos.all(queryLuminosidad, [req.query.id], pedirLuminosidad2);

}

/*===================================================
====================================================*/

/*===================================================
====================================================*/

/******************* SALINIDAD ********************/
app.get("/salinidad",  [comprobar_login, pedirSalinidad]);
/* 
Método que permite mediciones de salinidad de una sonda en concreto pasada como parámetro por la url
*/

function pedirSalinidad(req, res) {

	var querySalinidad = "SELECT salinidad FROM medidas WHERE id =?;";

	function pedirSalinidad2(err, row) {

		if (err) {
			console.log("error: " + err)
		} else {

			res.send(row);
		}

	}
	base_datos.all(querySalinidad, [req.query.id], pedirSalinidad2);

}

/*===================================================
====================================================*/
/*===================================================
====================================================*/
/*===================================================
====================================================*/
/*===================================================
====================================================*/
/*===================================================
====================================================*/
/*===================================================
====================================================*/
/*===================================================
====================================================*/
// NUEVO IMPLEMENTADO
/*===================================================
====================================================*/
/* Método que devuelve la lista de usuarios/empleados registrados de un cliente */
app.get("/usuarios",  [comprobar_login, getUsers]);

function getUsers(peticion, respuesta) {
	var queryUsers = "SELECT * FROM clientes";
	base_datos.all(queryUsers, function (error, fila) {
		if (error) {
			console.log("error: " + err)
		} else {
			respuesta.send(fila);
		}
	});
};

/*===================================================
====================================================*/

/*===================================================
====================================================*/
/* Método que añade un cliente a la base de datos */
app.get("/usuario",  [comprobar_login, addUser]);

function addUser(peticion, respuesta) {
	var queryAddUser = "INSERT INTO clientes(EMAIL, NOMBRE, APELLIDO, ROL, PASSWORD, ACTIVO) VALUES(?,?,?,?, 'segundoSprint', 0)";

	base_datos.run(queryAddUser, [peticion.query.email, peticion.query.nombre, peticion.query.apellido, peticion.query.rol],
		(error) => {
			if (error) {
				console.log("error: " + error)
			} else {

				console.log("Usario introducido correctamente");

			}
		});
};

/*===================================================
====================================================*/

/* Método que elimina a un usuario por id */
app.get("/EliminarUsuario",  [comprobar_login, deleteUser]);

function deleteUser(peticion, respuesta) {
	var queryDeleteUser = "DELETE FROM clientes WHERE id=?";
	base_datos.run(queryDeleteUser, [peticion.query.id], (error) => {
		if (error) {
			console.log("error: " + error)
		} else {

			console.log("Usario eliminado correctamente");
			respuesta.send("Usario eliminado correctamente");

		}
	});

};

/*===================================================
====================================================*/

/*===================================================
====================================================*/

/* Método que busca a un usuario por id */
app.get("/GetUsuario",  [comprobar_login, getUser]);

function getUser(peticion, respuesta) {
	var queryDeleteUser = "SELECT * FROM clientes WHERE id=?";
	base_datos.get(queryDeleteUser, [peticion.query.id], (error) => {
		if (error) {
			console.log("error: " + error)
		} else {

			console.log(fila);

		}
	});

};

/*===================================================
====================================================*/
/* Método que guarda los cambios en un usuario */

app.get("/EditarUsuario",  [comprobar_login, editUser]);

function editUser(peticion, respuesta) {
	var queryEditUser = "UPDATE clientes SET EMAIL=?, NOMBRE=?, APELLIDO=?, ROL=?, PASSWORD=? WHERE ID=?";
	var userData = [peticion.query.email,
		peticion.query.nombre,
		peticion.query.apellido,
		peticion.query.rol,
		peticion.query.password,
		peticion.query.id
	];

	base_datos.run(queryEditUser, userData, (error) => {
		if (error) {
			console.log("error: " + error)
		} else {
			console.log("Usuario actualizado correctamente");
		}
	});
};

/*================= CRUD ZONAS ======================
====================================================*/
/*================= ADD ZONA ========================
====================================================*/
/* Método que añade una zona a la base de datos  */
app.get("/addZona",  [comprobar_login, addZona]);

function addZona(peticion, respuesta) {
	var queryAddZona = "INSERT INTO zonas (NOMBRE, COLOR) VALUES(?,?)";

	base_datos.run(queryAddZona, [peticion.query.nombre, peticion.query.color],
		(error) => {
			if (error) {
				console.log("error: " + error)
			} else {
				console.log("Zona creada correctamente");

			}
		});
};

/*===================================================
====================================================*/
/*============== DELETE ZONA ========================
====================================================*/
/* Método que ELIMINA una zona a la base de datos  */

app.get("/EliminarZona",  [comprobar_login, deleteZona]);

function deleteZona(peticion, respuesta) {

	var querySelectZona = "SELECT * FROM zonas WHERE VERTICE_ID=?";
	var queryDeleteZona = "DELETE FROM zonas WHERE VERTICE_ID=?";
	var queryDeleteVertices = "DELETE FROM vertice WHERE ZONA=?";
	var queryDeleteSondas = "DELETE FROM sondas_zonas WHERE ZONA=?";
	var queryDeleteAlertas = "DELETE FROM alertas WHERE zona=?";

	

	base_datos.get(querySelectZona, [peticion.query.id], function (error, row) {

		if (row) {

			base_datos.run(queryDeleteZona, [peticion.query.id], function (error){
				console.log("Zona eliminada correctamente");
			});

			base_datos.run(queryDeleteVertices, [peticion.query.id], function (error){
				console.log("Vertices eliminados correctamente");
			});

			base_datos.run(queryDeleteSondas, [peticion.query.id], function (error){
				console.log("Asociación de sondas borrada correctamente");
			});

			base_datos.run(queryDeleteAlertas, [peticion.query.id], function (error){
				console.log("Asociación de alertas borrada correctamente");
			});

		}
		console.log("No existe esa zona: " + error);
	});

}

/*===================================================
====================================================*/
/*============== EDITAR ZONA ========================
====================================================*/
/* Método que EDITA una zona a la base de datos  */

app.get("/editarZona",  [comprobar_login, editZona]);

function editZona(peticion, respuesta) {
	var queryEditZona = "UPDATE zonas SET NOMBRE=?, COLOR=? WHERE VERTICE_ID=?";
	var userData = [peticion.query.nombre,
		peticion.query.color,
		peticion.query.id
	];

	base_datos.run(queryEditZona, userData, (error) => {
		if (error) {
			console.log("error: " + error)
		} else {
			console.log("Zona actualizada correctamente");
		}
	});
};


/*===================================================
====================================================*/
/*============== GET ALERTAS ========================
====================================================*/
/* Método que devuelve un array con las alertas */

app.get("/alertas",  [comprobar_login, getAlertas]);

function getAlertas(peticion, respuesta) {
	var queryAlertas = "SELECT * FROM alertas";

	base_datos.all(queryAlertas, function (error, alertas) {
		if (error) {
			console.log("error: " + error)
		} else {
			respuesta.send(alertas);
		}
	});
};


app.listen(app.get('port'), function () {
	console.log('Node está funcionando en el puerto: ', app.get('port'));
});