import {createSlice, PayloadAction} from "@reduxjs/toolkit"

interface PointsState{
    pointsBalance: number;
}

const initialState: PointsState = {
    pointsBalance: 150,
}

export const pointsSlice = createSlice({
    name: "points",
    initialState,
    reducers: {
        setPointsBalance: (state, action: PayloadAction<number>)=>{
            console.log("BALANCE: ",action.payload)
            state.pointsBalance = action.payload;
        },
        incrementPoints: (state, action: PayloadAction<number>)=>{
            state.pointsBalance += action.payload
        },
        decrementPoints: (state, action: PayloadAction<number>) => {
            state.pointsBalance -= Math.max(0, state.pointsBalance - action.payload);
        }
    }
})

export const { setPointsBalance, incrementPoints, decrementPoints } = pointsSlice.actions


export default pointsSlice.reducer