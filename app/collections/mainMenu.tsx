'use client'

import {FC, useState} from 'react'
import {logout} from '../login/actions'
import {useAppContext} from './context'

const MainMenu: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {user} = useAppContext()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div>
      <button onClick={toggleMenu} className="bg-transparent text-base-content p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-4 top-10 mt-2 w-48 bg-base-100 border border-base-300 rounded shadow-lg">
          <div className="p-4 border-b border-base-200">
            <p className="text-base-content">{user.email}</p>
          </div>
          <button
            // If you just do onClick={logout}, the click event will be passed to the logout
            // function, and you get an error because you can't pass all that to a server action.
            onClick={() => logout()}
            className="w-full text-left px-4 py-2 text-base-content hover:bg-base-200"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default MainMenu
