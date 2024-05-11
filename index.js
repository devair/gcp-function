/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const APP_ENDPOINT = process.env.APP_ENDPOINT || "https://localhost";

exports.authUser = async (req, res) => {
    const contentType = req.headers["content-type"];

    if (!contentType) {
        return res.status(403).send({ message: "Content-Type is missing" });
    }

    if (contentType !== "application/json") {
        return res
            .status(403)
            .send({ message: "Content-Type must be application/json" });
    }

    if (req.method == "POST") {
        const { name, cpf, email, phone, password } = req.body;
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            return res.status(200).json({ data: userRecord });
        } catch (err) {
            console.error(err); // o método retornar uma exception quando nao encontra o e-mail
        }

        try {
            userRecord = await admin.auth().createUser({
                email: email,
                password: password,
            });
        } catch (err) {
            return res.status(403).send({ message: err.message });
        }

        if (userRecord) {
            try {
                const response = await fetch(APP_ENDPOINT + '/customers', {
                    method: "post",
                    body: JSON.stringify({
                        email,
                        phone,
                        cpf,
                        name,
                        firebaseid: userRecord.uid,
                    }),
                    headers: {'Content-Type': 'application/json'}
                });

                return res.status(response.status).json(response.body);
            } catch (err) {
                return res.status(403).send({ message: err });
            }
        }
    } else {
        return res
            .status(403)
            .send({ message: `Method not ${req.method} allowed` });
    }
};
