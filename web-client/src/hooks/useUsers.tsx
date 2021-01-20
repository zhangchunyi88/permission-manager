import React, {useState, useEffect, useContext, createContext} from 'react'
import {httpClient} from '../services/httpClient'
import {User} from "../types";

/**
 * UserProvider allows the client to load/add/delete/get kubernetes users
 */
interface UserProvider {
  
  /**
   * users obtained from refreshUsers
   */
  readonly users: User[];
  
  /**
   * adds an user
   * @param name
   */
  addUser({name}: { name: string }): void;
  
  /**
   * removes an user
   * @param id
   */
  removeUser({id}: { id: string }): void;
  
  /**
   * fetches users again from the backend
   */
  refreshUsers(): void;
  
  /**
   * if a fetchRequest is in progress
   */
  readonly loading: boolean;
  
  /**
   * if a fetchRequest has been completed
   */
  readonly loaded: boolean;
}


function useUsersFromApi(): UserProvider {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  function fetchUsers(): void {
    setLoading(true)
    httpClient.get('/api/list-users').then(res => {
      setLoading(false)
      setLoaded(true)
      setUsers(res.data)
    })
  }
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  function addUser({name}: { name: string }): void {
    httpClient.post('/api/create-user', {name}).then(res => {
      fetchUsers()
    })
  }
  
  function removeUser({id}: { id: string }): void {
    httpClient.post('/api/delete-user', {id}).then(res => {
      fetchUsers()
    })
  }
  
  return {
    users,
    addUser,
    removeUser,
    refreshUsers: fetchUsers,
    loading,
    loaded
  }
}

const UsersContext = createContext(null)

export const UsersProvider = ({children}) => {
  return (
    <UsersContext.Provider value={useUsersFromApi()}>
      {children}
    </UsersContext.Provider>
  )
}

/**
 * gets the UserProvider instance
 */
export function useUsers(): UserProvider {
  return useContext(UsersContext)
}
