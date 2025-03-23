import { connectToDatabase } from "../db/db";
import { initializeTaskModel } from './Tasks';

const { connection: globalDbConn} = await connectToDatabase('global-db')

export const Task = initializeTaskModel(globalDbConn)