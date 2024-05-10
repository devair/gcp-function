/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const APP_ENDPOINT = process.env.APP_ENDPOINT || 'https://localhost'

exports.authUser = async (req, res) => {

  if (req.method == "POST") {
      const { cpf, email, password, name } = req.body;      
      let userRecord;
      try{
        userRecord = await admin.auth().getUserByEmail(email);
        return res.status(200).json({ data: userRecord });
      }
      catch ( err ) 
      { console.error( err ); }
      
      userRecord = await admin.auth().createUser({        
        email: email,
        password: password        
      });

      res.status(200).json({ data: userRecord });

    /*

    if (validarCPF(cpf) && clienteAutorizado(cpf)) {
      return res.status(200).send("Cliente autenticado com sucesso!");
    } else {
      return res.status(403).send("Acesso não autorizado");
    }*/
  } else {
    res.status(403).send({ message: `Method not ${req.method} allowed` });
  }
};

// Função para validar o formato do CPF
function validarCPF(cpf) {
  if (!cpf) {
    return false;
  }
  return true;
}

// Função para verificar se o cliente está autorizado
function clienteAutorizado(cpf) {
  return true;
}
