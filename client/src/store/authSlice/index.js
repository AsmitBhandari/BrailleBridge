import { createSlice } from "@reduxjs/toolkit";

const intialState={
    isAuthenticated:false,
    isLoading:false,
    user:null,
}

const authSlice=createSlice({
    name:"auth",
})