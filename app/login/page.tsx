import {FC} from 'react'
import Login from '../ui/login'
import {login} from './actions'

const LoginPage: FC = () => <Login buttonText="Log in" onSubmit={login} />
export default LoginPage
