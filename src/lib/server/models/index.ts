import { connectToDatabase } from "../db/db";
import { initializeTaskModel } from './Tasks';
import { initializeUserModel } from "./User";

const { connection: globalDbConn} = await connectToDatabase('global-db')
const { connection: authDbConn } = await connectToDatabase('auth-db')


export const Task = initializeTaskModel(globalDbConn)
export const User = initializeUserModel(authDbConn)