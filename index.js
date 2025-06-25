import express from 'express'
import cors from 'cors'
import { Sequelize, DataTypes } from 'sequelize'
import finale from 'finale-rest'
import { auth } from 'express-oauth2-jwt-bearer'

const port = process.env.PORT || 8080
const app = express()

const jwtCheck = auth({
  audience: 'https://rest-api-production-7aa0.up.railway.app:8080',
  issuerBaseURL: 'https://dev-nso40w1sggzzrxnx.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'mysql-2318a6b2-michal-a9c9.l.aivencloud.com',
    port: 18836,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    pool: {
        max: 5,
        min: 0,
        acquire: 3600,
        idle: 1000
    }
})

const filmoteka = sequelize.define('filmoteka', {
    nazov: {type: DataTypes.TEXT, allowNull: false, primaryKey: true},
	rok: {type: DataTypes.INTEGER, allowNull: false},
	zaner: {type: DataTypes.TEXT, allowNull: false},
	subzaner: {type: DataTypes.TEXT, allowNull: true},
	povod: {type: DataTypes.TEXT, allowNull: true},
	cz_dab: {type: DataTypes.TEXT, allowNull: false},
	sk_dab: {type: DataTypes.TEXT, allowNull: false},
	en_dab: {type: DataTypes.TEXT, allowNull: true},
	cz_tit: {type: DataTypes.TEXT, allowNull: false},
	sk_tit: {type: DataTypes.TEXT, allowNull: false},
	en_tit: {type: DataTypes.TEXT, allowNull: false},
	poradie: {type: DataTypes.INTEGER, allowNull: false},
	nosic: {type: DataTypes.TEXT, allowNull: false},
	typ: {type: DataTypes.TEXT, allowNull: false},
	obal: {type: DataTypes.TEXT, allowNull: true},
	cena: {type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0.00},
	studio: {type: DataTypes.TEXT, allowNull: true},
	produkcia: {type: DataTypes.TEXT, allowNull: true},
	distributor: {type: DataTypes.TEXT, allowNull: true},
	tag: {type: DataTypes.TEXT, allowNull: true},
	iso3: {type: DataTypes.TEXT, allowNull: true},
	csfd: {type: DataTypes.TEXT, allowNull: true}
}, {
    freezeTableName: true, // by deafault pluralizuje hlada - filmotekaS
    timestamps: false
})

app.use(cors())

finale
    .initialize({
        app: app,   // alebo iba app - ak sú kluč:hodnota rovnaké
        sequelize: sequelize
})

const resource = finale.resource({
    model: filmoteka,
    endpoints: ['/filmoteka','/filmoteka/:nazov'],
    actions: ['list', 'read']
})

resource.all.auth((req, res, context) => {
    return new Promise((resolve, reject) => {
        jwtCheck(req, res, arg => {
        if (arg) {
            res.status(401).send({message: "Unauthorized"});
            resolve(context.stop);
        } else {
            resolve(context.continue);
        }
        });
    })
})

console.log(process.env)

sequelize
    .sync()
    .then(() => app.listen(port, () => {
        console.log(`REST API listening on ${app.host} port ${port}`)
}))