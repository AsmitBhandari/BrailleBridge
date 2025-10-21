import CommonForm from '@/components/common/form';
import { LoginformConfig } from '@/config';
import { loginUser } from '@/store/authSlice';
import React from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import { toast } from 'sonner';
const initialState={
    email: '',
    password: ''
}
const AuthLogin = () => {
    const [formData, setFormData] = React.useState(initialState);
    const dispatch=useDispatch();
    function onsubmit(event){
      event.preventDefault();
      dispatch(loginUser(formData)).then(data=>{
        if(data?.payload?.success){
            toast("Logged in successfully");
        }
        else{
            toast(data.payload.message);
        }
      })
    };
    return (
        <div className="mx-auto w-full max-w-md space-y-6">
            <div className='text-center'>
                <h1 className='text-3xl font-bold tracking-tight text-foreground'>WelCome Back</h1>
            </div>
            <div>
                <CommonForm  
                  formControls={LoginformConfig}
                  buttonText={"Sign in"}
                  formData={formData}
                  setFormData={setFormData} 
                  onsubmit={onsubmit}
                />
            </div>
            <p className='mt-2'>Don't have an account?
                <Link className='font-medium ml-2 text-primery hover:underline' to="/auth/register">Sign up</Link></p>
        </div>
    )
}

export default AuthLogin

