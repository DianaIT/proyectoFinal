var urlBase = "http://localhost:4000";
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//metodo que valida el email y password para dirigirse a la pagina del usuario que inicia sesion
function getLogin()
{
    // cogemos los datos del formulario
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    var url = urlBase + "/login?email=" + email + "&password=" + password;
    // hacemos la petición al API
    fetch(url)
        .then((respuesta) => {
            if (!respuesta.ok) {
              //alert('Usuario o contraseña incorrectos')
            
              //guradamos la referencia a dónde queremos poner el mensaje de error en el formulario
              var error = document.getElementsByClassName("error")[0];
              //Metemos el mensaje de error dentro del div con la clase .error
              console.log(error);
              error.innerHTML = `<div class="alert alert-danger" role="alert">
              <strong>¡Vaya!</strong> Usuario y/o contraseña incorrecta.
              </div>`;
              error.style.visibility = 'visible';
              setTimeout(function(){
                //error.classList.add("hidden");
                error.style.visibility = 'hidden';
              }, 3000);

            } else {
                // procesamos el JSON
                respuesta.json().then((datos) => {
                    // colocamos las cookies
                    console.log(datos)
                    document.cookie = 'email=' + email
                    document.cookie = 'password=' + password
                    // cargamos una nueva página
                    if (datos.ACTIVO == 1){
                      // Creamos la url de destino, la página de zonas 
                      var urlDestino = "/mapa";
                      //Dirigimos la aplicación a la pagína de zonas
                      window.location.href = urlDestino
                    } else {
                      // Creamos la url de destino, la página de perfil con los datos del usuario en la url  
                      var urlDestino = "/perfil";
                      //Dirigimos la aplicación al a pagína de perfil con la variable url antes declarada
                      window.location.href = urlDestino
                    }
                })
            }
        })
}

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge las ZONAS de dicho cliente
function zonasGet(email, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaZonas = urlBase + "/zonas?email=" + email;

  //Hacemos la peticion
  fetch(urlListaZonas, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(zonas) {
      callback(zonas);
    });
}
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge los datos de la lista de sensores de la base de datos por el nombre del usuario que esta iniciado
function sensoresGet(email, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaSensores = urlBase + "/sensores?email=" + email;

  //Hacemos la peticion
  fetch(urlListaSensores, {credentials: 'include'})
    .then(function(respuesta) {
    return respuesta.json();
    })
    .then(function(valores) {
      callback(valores);
    });
}
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge la TEMPERATURA de dicha SONDA
function temperaturaGet(email, sensor, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaTemperatura =
    urlBase + "/temperatura?email=" + email + "&id=" + sensor;

  //Hacemos la peticion
  fetch(urlListaTemperatura, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(valores) {
      callback(valores);
    });
}
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge la HUMEDAD de dicha SONDA
function humedadGet(email, sensor, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaHumedad =
    urlBase + "/humedad?email=" + email + "&id=" + sensor;

  //Hacemos la peticion
  fetch(urlListaHumedad, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(valores) {
      callback(valores);
    });

}
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge la SALINIDAD de dicha SONDA
function salinidadGet(email, sensor, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaSalinidad =
    urlBase + "/salinidad?email=" + email + "&id=" + sensor;

  //Hacemos la peticion
  fetch(urlListaSalinidad, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(valores) {
      callback(valores);
    });

}

function valoresGet(tipo, email, sensor, callback){
   //creamos la URL para hacer la peticion a la api
   var urlValores = urlBase + "/" + tipo +"?email=" + email + "&id=" + sensor;

 //Hacemos la peticion
 fetch(urlValores, {credentials: 'include'})
   .then(function(respuesta) {
     return respuesta.json();
   })
   .then(function(valores) {
  
     callback(valores);
   });
};
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//recoge la ILUMINACION de dicha SONDA
function iluminacionGet(email, sensor, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaIluminacion =
    urlBase + "/iluminacion?nombre=" + email + "&id=" + sensor;

  //Hacemos la peticion
  fetch(urlListaIluminacion, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(objetoJson) {
      callback(objetoJson);
    });

}


// NUEVA IMPLEMENTACIÓN 
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//devuelve lista de clientes de la base de datos
function usersGet(callback) {
  //creamos la URL para hacer la peticion a la api
  var urlUsers = urlBase + "/usuarios";

  //Hacemos la peticion
  fetch(urlUsers, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(usuarios) {
      callback(usuarios);
    });
}

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//Ingresa un nuevo usuario en la tabla clientes de la BBDD
function userAdd(datosUser, callback) {
    //creamos la URL para hacer la peticion a la api
    var urlAddUser = urlBase + "/usuario" + datosUser;
  
    //Hacemos la peticion
    fetch(urlAddUser, {credentials: 'include'})
      .then(function(respuesta) {
        return respuesta.json();
      })
      .then(function(data) {
        callback(data);
      });
  }

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//Borrar un usuario de la BBDD por su id
function userDelete(id, callback) {

    //creamos la URL para hacer la peticion a la api
    var urlDeleteUser = urlBase + "/EliminarUsuario?id=" + id;
  
    //Hacemos la peticion
    fetch(urlDeleteUser, {credentials: 'include'})
      .then(function(respuesta) {
        return respuesta;
      })
      .then(function(data) {
        callback(data);
      });
  }

  //----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
//Buscar un usuario de la BBDD por su id 
function getUser(id, callback) {

    //creamos la URL para hacer la peticion a la api
    var urlGetUserID = urlBase + "/GetUsuario?id=" + id;
  
    //Hacemos la peticion
    fetch(urlGetUserID, {credentials: 'include'})
      .then(function(respuesta) {
        return respuesta.json();
      })
      .then(function(data) {
        callback(error, data);
      });
  }
  
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------


//EDITAR USUARIO

function usuarioEditar(datosUsuario, callback) {

  //creamos la URL para hacer la peticion a la api
  var urlEditUser = urlBase + "/editarUsuario" + datosUsuario;

  //Hacemos la peticion
  fetch(urlEditUser, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta;
    })
    .then(function(data) {
      callback(data);
    });
}


//----------------------------------------------------------------------------------------------------------
//--------------------------------------CRUD ZONAS ---------------------------------------------------------
//ELIMINAR ZONA
function zonaDelete(datos, callback) {

  //creamos la URL para hacer la peticion a la api
  var urlDeleteZona = urlBase + "/EliminarZona" + datos;
  //Hacemos la peticion
  fetch(urlDeleteZona, {credentials: 'include'}).then(function(respuesta) {
      return respuesta.json;
    }).then(function(data) {
      callback(data);
    });
}

//AÑADIR ZONA
function zonaAdd(datosZona, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlAddZona = urlBase + "/addZona" + datosZona;

  //Hacemos la peticion
  fetch(urlAddZona, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(data) {
   
      callback(data);
    });
}

function verticesUpdate(id, vertices){
  fetch(urlBase + "/vertices", {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			/* NO FUNCIONABA HASTA PONER ESTO DE ARRIBA
			fuente ==> https://es.stackoverflow.com/questions/55250/problema-al-recibir-el-body-en-nodejs-desde-javascript/55263#55263
			*/
			credentials: 'include',
			/* 
			HAY QUE PASARLE LOS DATOS SIEMPRE CON JSON.strigify SI NO TAMPOCO FUNCIONA
			*/
			body: JSON.stringify({
				zona: id,
				vertices: vertices
			})

		}).then(function (response) {
			return response;
		}).then(function (data) {

		});
}
//EDITAR ZONA
function zonaEditar(datosZona, callback) {

  //creamos la URL para hacer la peticion a la api
  var urlEditZona = urlBase + "/editarZona" + datosZona;

  //Hacemos la peticion
  fetch(urlEditZona, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta;
    })
    .then(function(data) {
      callback(data);
    });
}

//GET TODAS LAS ZONAS
function allZonasGet(email, callback) {
  //creamos la URL para hacer la peticion a la api
  var urlListaSensores = urlBase + "/zonas?email=" + email;

  //Hacemos la peticion
  fetch(urlListaSensores, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(zonas) {
      callback(zonas);
    });
}

//GET TODAS LAS ZONAS
function ZonasGetAll(callback) {
  //creamos la URL para hacer la peticion a la api
  var urllistaTodasZonas = urlBase + "/zonasAll";

  //Hacemos la peticion
  fetch(urllistaTodasZonas, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(zonas) {
      callback(zonas);
    });
}

//----------------------------------------------------------------------------------------------------------
//-------------------------------------- ALERTAS -----------------------------------------------------------

function alertasGet(callback){
  //creamos la URL para hacer la peticion a la api
  var urlAlertas = urlBase + "/alertas";

  //Hacemos la peticion
  fetch(urlAlertas, {credentials: 'include'})
    .then(function(respuesta) {
      return respuesta.json();
    })
    .then(function(alertas) {
      callback(alertas);
    });
}

/**C********S**********************
 ***O*****A***E***A****************
 ****N**R*******Ñ******************
 *****T***************************/ 

function codigoGenerated(datos){

  var urlP = urlBase + "/generarCodigo" + datos ;

  fetch(urlP).then((res)=>{
    return res.json();

  }).then((data)=>{
    console.log(data) ;
    dibujarCodigo();
  })

}

function comprobandoCodigo(datos, codigoIntroducido){
  var urlCC = `${urlBase}/${datos}` ;

  fetch(urlCC).then((res)=>{
    return res.json();
  }).then((data)=>{
    console.log(data);
    if(data.CODIGOEMAIL ==  codigoIntroducido){
    dibujarPassword();
    }
  })
}

function codigoDeleted(email){

  var urlP = urlBase + "/destruir" + email ;

  fetch(urlP).then((res)=>{
    return res.json();

  }).then((data)=>{
    console.log(data) ;
    console.log("Código destruido") ;
  })

}

function changePassword(email, clave){

  var url = `${urlBase}/cambiarPassword/${email}/${clave}`;

fetch(url).then((res)=>{
  return res.json();
}).then((data)=>{
  console.log(data);
})
}


/* ----------------------------------------
Llamada a la API que genera un archivo csv con TODAS las mediciones
si se ha creado correctamente, aparecererá en descargas del navegador
-------------------------------------------

f()

*/

function getCsv(){

   //Hacemos la peticion
   fetch(urlBase + "/csv", {credentials: 'include'})
   .then(function(datos) {
     return datos.json();
   })
   .then(function(fileName) {
     window.location.href = urlBase  + fileName.ruta;
 
   });
}

/* ----------------------------------------
Llamada a la API que recoge la lista de cultivos disponibles
-------------------------------------------
--> callback: Función que ejecutará lo que queramos hacer con los datos obtenidos
f()
--> [
  {"cultivo": "Brócoli"}, 
  {"cultivo": "Fresa"} 
  ... ];
*/

function getCultivos(callback){
  //Hacemos la peticion
  fetch(urlBase + "/cultivos", {credentials: 'include'})
  .then(function(datos) {
    return datos.json();
  })
  .then(function(cultivos) {
    callback(cultivos);
  });
}

/* ----------------------------------------
Llamada a la API que recoge la lista de tolerancias de un cultivo en concreto
La tolerancia es un rango 30-50 dónde por debajo de 30 y por encima de 50 se crearía una alerta
-------------------------------------------
--> cultivo: TEXT 
--> callback: Función que ejecutará lo que queramos hacer con los datos obtenidos
f()
--> [
  {"id": 1, "cultivo": "Brócoli", "temperatura": "34-45" ... }, 
  {"id": 2, "cultivo": "Fresa" ... } 
  ... ];
*/

function getCultivos(cultivo, callback){
  //Hacemos la peticion
  fetch(`${urlBase}/tolerancia/${cultivo}`, {credentials: 'include'})
  .then(function(datos) {
    return datos.json();
  })
  .then(function(tolerancias) {
    callback(tolerancias);
  });
}