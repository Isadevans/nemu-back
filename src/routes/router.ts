import express from 'express'
import {journeyController} from "../controllers/journey";

const app = express()

export async function registerRouters() {
    app.get('/journeys',journeyController)

}
