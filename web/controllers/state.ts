import {Schema} from "mongoose"
import {IState} from "../schemas/state"
import models from "../models"

export default async function storeState(device: Schema.Types.ObjectId, media: Schema.Types.ObjectId) {
  const state: IState = await models.State.create({device, media})
  return state
}