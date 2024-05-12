/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const APP_ENDPOINT = process.env.APP_ENDPOINT || "https://localhost";
const admin = require("firebase-admin");

admin.initializeApp();


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

        let customer;
        if (cpf) {
            customer = await pgFindUser(cpf);
            if (!customer) {
                customer = await pgCreateUser({ name, cpf, email, phone });
            }
        }

        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
        } catch (err) {
            console.error(err); // o método retornar uma exception quando nao encontra o e-mail
        }

        try {
            if (!userRecord) {
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    phoneNumber: phone,
                    displayName: name,
                });
            }

            let token;
            if (userRecord ) {
                if(cpf){
                    await admin.auth().setCustomUserClaims(userRecord.uid, { cpf });
                    // get user with CustomUserClaims
                    userRecord = await admin.auth().getUser(userRecord.uid);
                }
            }

            const dataReturn = { userRecord };

            return res.status(200).json(dataReturn);
        } catch (err) {
            return res.status(403).send({ message: err.message });
        }
    } else {
        return res
            .status(403)
            .send({ message: `Method not ${req.method} allowed` });
    }
};

pgCreateUser = async ({ name, cpf, email, phone }) => {
    const response = await fetch(APP_ENDPOINT + "/customers", {
        method: "post",
        body: JSON.stringify({
            email,
            phone,
            cpf,
            name,
        }),
        headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
        return response.body;
    }
    return null;
};

pgFindUser = async (cpf) => {
    const response = await fetch(
        APP_ENDPOINT + "/customers/search?cpf=" + cpf,
        {
            method: "get",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (response.ok) {
        return response.body;
    }
    return null;
};
