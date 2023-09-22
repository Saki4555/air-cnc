import { createBrowserRouter } from 'react-router-dom'
import Main from '../layouts/Main'
import Home from '../pages/Home/Home'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'
import RoomDetails from '../pages/RoomDetails/RoomDetails'
import PrivateRoute from './PrivateRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import AddRoomForm from '../pages/Dashboard/AddRoom'
import { getRoom } from '../api/room'
import ManageBookings from '../pages/Dashboard/MyBookings'
import MyListings from '../pages/Dashboard/MyListings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/room/:id',
        element: (
          <PrivateRoute>
            <RoomDetails />
          </PrivateRoute>
        ),
        loader: ({ params }) =>{
          // console.log(params.id)
          // getRoom(params)
          return getRoom(params.id);
        }
       
      },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardLayout></DashboardLayout></PrivateRoute>,
    children: [
      {
        path: '/dashboard/',
        element: <ManageBookings></ManageBookings>
      },
      {
        path: '/dashboard/add-room',
        element: <AddRoomForm></AddRoomForm>
      },
    
      {
        path: '/dashboard/my-bookings',
        element: <ManageBookings></ManageBookings>
      },
      {
        path: '/dashboard/my-listings',
        element: <MyListings></MyListings>
      }
    ]
  }
])
